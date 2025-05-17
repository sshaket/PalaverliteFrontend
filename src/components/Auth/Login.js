import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { InputGroup, Container, Alert, Form, Button } from 'react-bootstrap';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';
import '../../styles/Login.css';
import config from '../../config';
import CryptoJS from 'crypto-js';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hashedPassword = CryptoJS.SHA256(password).toString();
            const response = await axios.post(`${config.BASE_URL}/api/auth/login`, { username, password: hashedPassword });
            if (response.status === 200 || response.status === 201) {
                setIsAuthenticated(true);
                localStorage.setItem('userId', response.data.userId); // Store user ID in local storage
                localStorage.setItem('token', response.data.token); // Store JWT in local storage
                navigate('/feed');
            } else {
                setError('Username does not exist or password does not match');
            }
        } catch (err) {
            if (err.response && err.response.status === 401 && err.response.data.message === 'Email not verified. Please verify your email to log in.') {
                setError('Email not verified. Please verify your email to log in.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-100 login-container"
            >
                <h2 className="text-center mb-4">Login</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="username">Username:</Form.Label>
                        <Form.Control
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="password">Password:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <InputGroup.Text style={{height: '38px'}} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeSlashFill /> : <EyeFill />}
                            </InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Button type="submit" className="w-100" variant="primary">Login</Button>
                </Form>
                <div className="text-center mt-3">
                    <span>Don't have an account yet? </span>
                    <Link to="/signup">Sign up</Link>
                </div>
                <div className="text-center mt-3">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </motion.div>
        </Container>
    );
};

export default Login;