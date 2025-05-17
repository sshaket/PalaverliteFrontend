import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config';
import UserProfileSidebar from '../Profile/UserProfileSidebar';
import io from 'socket.io-client';

const socket = io(config.BASE_URL);

const ViewFeed = () => {
    const [posts, setPosts] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [newCommentText, setNewCommentText] = useState({});
    const [baseUrl, setBaseUrl] = useState(''); // New state for base URL

    const userId = localStorage.getItem('userId');
    

    // useEffect(() => {
    //     // Determine the base URL based on the USE_S3 environment variable
        
    // }, []);

    // useEffect(() => {
    //         if (baseUrl) {
    //             fetchPosts();
    //         }
    //     }, [baseUrl]); // Fetch posts only after baseUrl is set
    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${config.BASE_URL}/api/posts`);
            const updatedPosts = await Promise.all(response.data.map(async post => {
                const likesResponse = await axios.get(`${config.BASE_URL}/api/posts/${post.id}/likes`);
                const commentsResponse = await axios.get(`${config.BASE_URL}/api/posts/${post.id}/comments`);
                const userLiked = likesResponse.data.some(like => like.user_id === parseInt(userId, 10));
                console.log("User Liked:", userLiked);
                console.log("Base URL of Feed:", baseUrl);
                return {
                    ...post,
                    profilePicture: `${baseUrl}/${post.profilePicture}`,
                    photo: post.photo ? `${baseUrl}/${post.photo}` : null,
                    video: post.video ? `${baseUrl}/${post.video}` : null,
                    likes: likesResponse.data.length,
                    comments: commentsResponse.data.length,
                    userLiked,
                };
            }));
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        const useS3 = process.env.REACT_APP_USE_S3 === 'true';
        if (useS3) {
            setBaseUrl(`https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com`);
        } else {
            setBaseUrl(`${config.BASE_URL}/uploads`);
        }
        fetchPosts();

        socket.on('newPost', () => {
            fetchPosts();
        });
        socket.on('likePost', async ({ postId }) => {
            try {
                const likesResponse = await axios.get(`${config.BASE_URL}/api/posts/${postId}/likes`);
                setPosts(posts => posts.map(post => {
                    if (post.id === postId) {
                        const userLiked = likesResponse.data.some(like => like.user_id === parseInt(userId, 10));
                        return { ...post, likes: likesResponse.data.length, userLiked };
                    }
                    return post;
                }));
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        });
        socket.on('newComment', ({ postId, comment }) => {
            setComments(prevComments => ({
                ...prevComments,
                [postId]: [...(prevComments[postId] || []), comment],
            }));
        });
        socket.on('profilePictureUpdated', async ({ userId: updatedUserId }) => {
            try {
                fetchPosts();
            } catch (error) {
                console.error('Error fetching updated profile picture:', error);
            }
        });

        return () => {
            socket.off('newPost');
            socket.off('likePost');
            socket.off('newComment');
            socket.off('profilePictureUpdated');
        };
    }, [baseUrl]);

    const handleCommentClick = async (postId) => {
        try {
            setShowComments(prevShowComments => ({
                ...prevShowComments,
                [postId]: !prevShowComments[postId],
            }));

            if (!comments[postId]) {
                const response = await axios.get(`${config.BASE_URL}/api/posts/${postId}/comments`);
                setComments(prevComments => ({
                    ...prevComments,
                    [postId]: response.data,
                }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (postId) => {
        const newComment = newCommentText[postId]?.trim();
        if (!newComment) return;

        try {
            await axios.post(`${config.BASE_URL}/api/posts/${postId}/comment`, {
                postId,
                userId,
                comment: newComment,
            });

            const response = await axios.get(`${config.BASE_URL}/api/posts/${postId}/comments`);
            setComments(prevComments => ({
                ...prevComments,
                [postId]: response.data,
            }));

            setNewCommentText(prevText => ({
                ...prevText,
                [postId]: '',
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditPost = (postId, content) => {
        setEditPostId(postId);
        setEditContent(content);
        setShowEditModal(true);
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`${config.BASE_URL}/api/posts/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`${config.BASE_URL}/api/posts/${editPostId}`, { content: editContent });
            setPosts(posts.map(post => post.id === editPostId ? { ...post, content: editContent } : post));
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleLikePost = async (postId) => {
        console.log(`Liking post with ID: ${postId}`);
        try {
            await axios.post(`${config.BASE_URL}/api/posts/${postId}/like`, { userId, postId });
            
            socket.emit('likePost', { postId, userId });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={4} className="order-md-1 order-1">
                    <UserProfileSidebar />
                </Col>
                <Col md={8} className="order-md-2 order-2">
                    <hr className="d-md-none" />
                    <h2>All Posts</h2>
                    <Card className="mb-4">
                        <Card.Body>
                            <div className="list-group">
                                {posts.map(post => (
                                    <div key={post.id} className="list-group-item mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <img
                                                src={post.profilePicture}
                                                alt="Profile"
                                                className="rounded-circle"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                            />
                                            <h5 className="mb-0">{post.user}</h5>
                                        </div>
                                        <p className="mb-1 post-content">{post.content}</p>
                                        {post.photo && <img src={post.photo} alt="Post" className="img-fluid mb-2" />}
                                        {post.video && <video src={post.video} controls className="img-fluid mb-2" />}
                                        <div className="d-flex justify-content-between mt-2">
                                            <Button
                                                variant={post.userLiked ? "primary" : "outline-primary"}
                                                className="me-2"
                                                onClick={() => handleLikePost(post.id)}
                                                // disabled={post.userLiked}
                                            >
                                                <FaThumbsUp /> Like ({post.likes})
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => handleCommentClick(post.id)}>
                                                <FaComment /> Comment ({post.comments})
                                            </Button>
                                        </div>
                                        {showComments[post.id] && (
                                            <div className="mt-3 comment-box" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                <div className="mb-3">
                                                    <Form.Group className="d-flex">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Add your comments/ thoughts"
                                                            value={newCommentText[post.id] || ''}
                                                            onChange={(e) => setNewCommentText(prevText => ({
                                                                ...prevText,
                                                                [post.id]: e.target.value,
                                                            }))}
                                                        />
                                                        <Button
                                                            variant="primary"
                                                            className="ms-2"
                                                            onClick={() => handleAddComment(post.id)}
                                                        >
                                                            Comment
                                                        </Button>
                                                    </Form.Group>
                                                </div>
                                                {comments[post.id]?.map(comment => (
                                                    <div key={comment.id} className="mb-2">
                                                        <div className="d-flex align-items-start">
                                                            <img
                                                                src={`${baseUrl}/${comment.profile_picture}`}
                                                                alt="Profile"
                                                                className="rounded-circle"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                                            />
                                                            <div>
                                                                <strong>{comment.username}</strong>
                                                                <p style={{ color: 'black', margin: 0, wordBreak: 'break-word' }}>{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <small className="text-muted">{new Date(post.createdAt).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="editPostContent">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ViewFeed;