import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../../styles/ForgotPassword.css';
import config from '../../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/forgot-password`, { email });
            if (response.status === 200) {
                setOtpToken(response.data.otpToken);
                setStep(2);
                setSuccess('OTP sent to email. Please check your inbox.');
            } else {
                setError('Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/verify-otp-reset-password`, { otpToken, otp, newPassword, confirmPassword });
            if (response.status === 200) {
                setSuccess('Password reset successfully. Redirecting to login page...');
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(response.data.message || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                if (err.response.data.message === 'OTP expired') {
                    setError('OTP expired. Please regenerate OTP.');
                } else {
                    setError(err.response.data.message);
                }
            } else {
                setError('Failed to reset password. Please try again.');
            }
        }
    };

    const handleRegenerateOtp = async () => {
        setError('');
        setSuccess('');
        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/forgot-password`, { email });
            if (response.status === 200) {
                setOtpToken(response.data.otpToken);
                setSuccess('New OTP sent to email. Please check your inbox.');
            } else {
                setError('Failed to send new OTP. Please try again.');
            }
        } catch (err) {
            setError('Failed to send new OTP. Please try again.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-100 forgot-password-container"
            >
                <h2 className="text-center mb-4">Forgot Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                {step === 1 && (
                    <Form onSubmit={handleEmailSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="email">Email:</Form.Label>
                            <Form.Control
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" className="w-100" variant="primary">Send OTP</Button>
                    </Form>
                )}
                {step === 2 && (
                    <Form onSubmit={handleOtpSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="otp">OTP:</Form.Label>
                            <Form.Control
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </Form.Group>
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
                        <Button type="button" className="w-100 mt-3" variant="secondary" onClick={handleRegenerateOtp}>Regenerate OTP</Button>
                    </Form>
                )}
            </motion.div>
        </Container>
    );
};

export default ForgotPassword;