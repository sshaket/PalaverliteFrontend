import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Dropdown } from 'react-bootstrap';
import { FaVideo, FaImage, FaThumbsUp, FaComment, FaEdit, FaTrash, FaTimes, FaEllipsisH } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config';
import UserProfileSidebar from '../Profile/UserProfileSidebar';
import io from 'socket.io-client';
import '../../styles/ViewPosts.css';

const socket = io(config.SOCKET_URL);

const ViewPosts = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [video, setVideo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [videoName, setVideoName] = useState('');
    const [photoName, setPhotoName] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const userId = localStorage.getItem('userId');
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [newCommentText, setNewCommentText] = useState({}); // New state for comment input
    const [baseUrl, setBaseUrl] = useState(''); // New state for base URL
    
    // useEffect(() => {
    //     // Determine the base URL based on the USE_S3 environment variable
    //     const useS3 = process.env.REACT_APP_USE_S3 === 'true';
    //     if (useS3) {
    //         setBaseUrl(`https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com`);
    //     } else {
    //         setBaseUrl(`${config.BASE_URL}/uploads`);
    //     }
    // }, []);

    // useEffect(() => {
    //     if (baseUrl) {
    //         fetchPosts();
    //     }
    // }, [baseUrl]); // Fetch posts only after baseUrl is set
    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${config.BASE_URL}/api/posts/user/${userId}`);
            console.log("Base URL of View Posts:", baseUrl);
            const updatedPosts = await Promise.all(response.data.map(async post => {
                const likesResponse = await axios.get(`${config.BASE_URL}/api/posts/${post.id}/likes`);
                const commentsResponse = await axios.get(`${config.BASE_URL}/api/posts/${post.id}/comments`);
                const userLiked = likesResponse.data.some(like => like.user_id === parseInt(userId, 10));
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
        socket.on('deletePost', (postId) => {
            setPosts(posts => posts.filter(post => post.id !== postId));
        });
        // socket.on('likePost', ({ postId, userId }) => {
        //     setPosts(posts => posts.map(post => {
        //         if (post.id === postId) {
        //             const userLiked = post.userLiked ? post.userLiked : userId === parseInt(localStorage.getItem('userId'), 10);
        //             const likes = userLiked ? post.likes + 1 : post.likes - 1;
        //             return { ...post, likes, userLiked };
        //         }
        //         return post;
        //     }));
        // });
        socket.on('likePost', async ({ postId, userId }) => {
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
                [postId]: [...(prevComments[postId] || []), comment], // Append the new comment
            }));
        });
        socket.on('profilePictureUpdated', ({ userId: updatedUserId, profilePicture }) => {
            if (updatedUserId === localStorage.getItem('userId')) {
                const updatedProfilePicture = `${baseUrl}/${profilePicture}`;
                setPosts(posts => posts.map(post => ({
                    ...post,
                    profilePicture: updatedProfilePicture
                })));
            }
        });

        return () => {
            socket.off('newPost');
            socket.off('deletePost');
            socket.off('likePost');
            socket.off('newComment');
            socket.off('profilePictureUpdated');
        };
    }, [userId, baseUrl]);

    const handleCommentClick = async (postId) => {
        try {
            // Toggle the visibility of the comments section
            setShowComments((prevShowComments) => ({
                ...prevShowComments,
                [postId]: !prevShowComments[postId],
            }));

            // Fetch comments only if they are not already fetched
            if (!comments[postId]) {
                const response = await axios.get(`${config.BASE_URL}/api/posts/${postId}/comments`);
                setComments((prevComments) => ({
                    ...prevComments,
                    [postId]: response.data,
                }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('content', content);
        if (photo) formData.append('photo', photo);
        if (video) formData.append('video', video);

        try {
            const response = await axios.post(`${config.BASE_URL}/api/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setContent('');
            setVideo(null);
            setPhoto(null);
            setVideoName('');
            setPhotoName('');
            socket.emit('newPost', response.data);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        setVideo(file);
        setVideoName(file.name);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoName(file.name);
    };

    const handleRemoveVideo = () => {
        setVideo(null);
        setVideoName('');
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        setPhotoName('');
    };

    const handleEditPost = (postId, content) => {
        setEditPostId(postId);
        setEditContent(content);
        setShowEditModal(true);
    };

    const handleAddComment = async (postId) => {
        const newComment = newCommentText[postId]?.trim();
        if (!newComment) return; // Prevent empty comments


        try {
            // Make an API call to add the comment to the backend
            await axios.post(`${config.BASE_URL}/api/posts/${postId}/comment`, {
                postId,
                userId, // The ID of the user adding the comment
                comment: newComment, // The content of the comment
            });

            // Fetch updated comments after successfully adding the new comment
            const response = await axios.get(`${config.BASE_URL}/api/posts/${postId}/comments`);
            setComments((prevComments) => ({
                ...prevComments,
                [postId]: response.data, // Ensure comments[postId] is directly an array of comments
            }));

            // Clear the input box for the new comment
            setNewCommentText((prevText) => ({
                ...prevText,
                [postId]: '',
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`${config.BASE_URL}/api/posts/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
            socket.emit('deletePost', postId); // Emit deletePost event
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
                    <Card className="mb-4">
                        <Card.Body>
                            <Form onSubmit={handlePostSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Start a post"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <Form.Label htmlFor="videoUpload" className="btn btn-outline-secondary">
                                            <FaVideo /> Upload Video
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="videoUpload"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            style={{ display: 'none' }}
                                        />
                                        {videoName && (
                                            <div className="d-flex align-items-center mt-2">
                                                <FaVideo className="me-2" />
                                                <span>{videoName}</span>
                                                <Button variant="link" className="text-danger ms-2" onClick={handleRemoveVideo}>
                                                    <FaTimes />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Form.Label htmlFor="photoUpload" className="btn btn-outline-secondary">
                                            <FaImage /> Upload Photo
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="photoUpload"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            style={{ display: 'none' }}
                                        />
                                        {photoName && (
                                            <div className="d-flex align-items-center mt-2">
                                                <FaImage className="me-2" />
                                                <span>{photoName}</span>
                                                <Button variant="link" className="text-danger ms-2" onClick={handleRemovePhoto}>
                                                    <FaTimes />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>
                                <Button type="submit" variant="primary">Post</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <hr />
                    <h2>Your Posts</h2>
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
                                            <Dropdown className="ms-auto">
                                                <Dropdown.Toggle
                                                    variant="link"
                                                    bsPrefix="text-decoration-none text-muted p-0"
                                                    id={`dropdown-${post.id}`}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    <FaEllipsisH />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleEditPost(post.id, post.content)}>
                                                        Edit
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleDeletePost(post.id)}>
                                                        Delete
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <p className="mb-1 post-content">{post.content}</p>
                                        {post.photo && <img src={post.photo} alt="Post" className="img-fluid mb-2" />}
                                        {post.video && <video src={post.video} controls className="img-fluid mb-2" />}
                                        <div className="d-flex justify-content-between mt-2">
                                            <Button
                                                variant={post.userLiked ? "primary" : "outline-primary"}
                                                className="me-2"
                                                onClick={() => handleLikePost(post.id)}
                                            >
                                                <FaThumbsUp /> Like ({post.likes})
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => handleCommentClick(post.id)}>
                                                <FaComment /> Comment ({post.comments})
                                            </Button>
                                        </div>
                                        {showComments[post.id] && (
                                            <div className="mt-3 comment-box" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {/* Add comment input box */}
                                                <div className="mb-3">
                                                    <Form.Group className="d-flex">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Add your comments/ thoughts"
                                                            value={newCommentText[post.id] || ''} // Safely access newComment
                                                            onChange={(e) => setNewCommentText((prevText) => ({
                                                                ...prevText,
                                                                [post.id]: e.target.value, // Update the input for the specific post
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
                                                {/* Display comments */}
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

export default ViewPosts;
