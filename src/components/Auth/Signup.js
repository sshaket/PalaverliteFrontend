import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Container, Alert, FloatingLabel, Row, Col, InputGroup } from 'react-bootstrap';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/Signup.css';
import config from '../../config';
import CryptoJS from 'crypto-js';

const Signup = () => {
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [photoError, setPhotoError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email address. Example: user@example.com');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character');
        } else {
            setPasswordError('');
        }
    };

    const validatePhoto = (file) => {
        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
        if (file && !allowedExtensions.includes(file.type)) {
            setPhotoError('Only image files (jpeg, png, jpg) are allowed');
            setPhoto(null);
        } else {
            setPhotoError('');
            setPhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        validateEmail();
        validatePassword();

        if (emailError || passwordError || photoError) {
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!gender) {
            setError('Please select a gender');
            return;
        }

        const hashedPassword = CryptoJS.SHA256(password).toString();
        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', hashedPassword);
        formData.append('gender', gender);

        if (photo) {
            formData.append('photo', photo);
        } else {
            const defaultProfilePic = gender === 'male' ? 'man.png' : 'woman.png';
            formData.append('profilePicture', defaultProfilePic);
        }

        try {
            const response = await axios.post(`${config.BASE_URL}/api/auth/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200 || response.status === 201) {
                setSuccess('Registration successful! Please verify your email.');
                // setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            if (err.response && err.response.data.error && err.response.data.error.name === 'SequelizeUniqueConstraintError') {
                const errors = err.response.data.error.errors;
                const uniqueUsernameError = errors.find(error => error.path === 'username');
                const uniqueEmailError = errors.find(error => error.path === 'email');

                if (uniqueUsernameError) {
                    setError('Username should be unique');
                } else if (uniqueEmailError) {
                    setError('Email should be unique');
                } else {
                    setError('Registration failed due to a unique constraint violation.');
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-100 signup-container"
            >
                <h2 className="text-center mb-4">Sign Up</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <FloatingLabel controlId="floatingFirstName" label="First Name" className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    value={firstname}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </FloatingLabel>
                        </Col>
                        <Col md={6}>
                            <FloatingLabel controlId="floatingLastName" label="Last Name" className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastname}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <FloatingLabel controlId="floatingUsername" label="Username" className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingEmail" label="Email address" className="mb-3">
                        <Form.Control
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={validateEmail}
                            isInvalid={!!emailError}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {emailError}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <InputGroup className="mb-3">
                        <FloatingLabel controlId="floatingPassword" label="Password">
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validatePassword}
                                isInvalid={!!passwordError}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {passwordError}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                        <InputGroup.Text style={{ height: '58px' }} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                        </InputGroup.Text>
                    </InputGroup>
                    <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-3">
                        <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </FloatingLabel>
                    <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <div className="d-flex">
                            <Form.Check
                                type="radio"
                                label="Male"
                                name="gender"
                                value="male"
                                checked={gender === 'male'}
                                onChange={(e) => setGender(e.target.value)}
                                className="me-3"
                                required
                            />
                            <Form.Check
                                type="radio"
                                label="Female"
                                name="gender"
                                value="female"
                                checked={gender === 'female'}
                                onChange={(e) => setGender(e.target.value)}
                                className="me-3"
                                required
                            />
                        </div>
                    </Form.Group>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload Photo</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => validatePhoto(e.target.files[0])}
                            isInvalid={!!photoError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {photoError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button type="submit" className="w-100" variant="primary">Sign Up</Button>
                </Form>
                <div className="text-center mt-3">
                    <span>Already have an account? </span>
                    <Link to="/login">Login</Link>
                </div>
            </motion.div>
        </Container>
    );
};

export default Signup;