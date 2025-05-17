import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content) {
            setError('Post content cannot be empty');
            return;
        }
        try {
            await axios.post(`${config.BASE_URL}/api/posts`, { content });
            setContent('');
            setError('');
            // Optionally, you can add logic to refresh the feed or notify the user
        } catch (err) {
            setError('Failed to create post. Please try again.');
        }
    };

    return (
        <div className="create-post">
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <textarea
                        className="form-control"
                        rows="4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary">Post</button>
            </form>
        </div>
    );
};

export default CreatePost;