import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../../styles/ResetPassword.css';
import config from '../../config';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/reset-password`, { token, newPassword });
            if (response.status === 200) {
                setSuccess('Password reset successfully. Redirecting to login page...');
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-100 reset-password-container"
            >
                <h2 className="text-center mb-4">Reset Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="newPassword">New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="confirmPassword">Confirm New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" className="w-100" variant="primary">Reset Password</Button>
                </Form>
            </motion.div>
        </Container>
    );
};

export default ResetPassword;