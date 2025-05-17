import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap'; // Add Button here
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import axios from 'axios';
import config from '../config';

const Feed = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${config.BASE_URL}/api/posts`);
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="container mt-4 feed-container">
            <div className="list-group">
                {posts.map(post => (
                    <div key={post.id} className="list-group-item">
                        <h5 className="mb-1">{post.user}</h5>
                        <p className="mb-1">{post.content}</p>
                        <small>{new Date(post.createdAt).toLocaleString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;