import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, FloatingLabel, Row, Col, InputGroup } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';
import config from '../../config';
import '../../styles/EditProfile.css';
import io from 'socket.io-client';

const socket = io(config.BASE_URL);
const EditProfile = () => {
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState(null);
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [profession, setProfession] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editableFields, setEditableFields] = useState({});
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${config.BASE_URL}/api/users/${userId}`);
                const userData = response.data;
                setFirstName(userData.firstname || '');
                setLastName(userData.lastname || '');
                setUsername(userData.username || '');
                setEmail(userData.email || '');
                setBio(userData.bio || '');
                setGender(userData.gender || '');
                setHobbies(userData.hobbies || '');
                setProfession(userData.profession || '');
                setCompany(userData.company || '');
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
            }
        };

        fetchUserData();
    }, [userId]);

    const validatePhoto = (file) => {
        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
        if (file && !allowedExtensions.includes(file.type)) {
            setError('Only image files (jpeg, png, jpg) are allowed');
            setPhoto(null);
        } else {
            setError('');
            setPhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('username', username);
        formData.append('bio', bio);
        formData.append('gender', gender);
        formData.append('hobbies', hobbies);
        formData.append('profession', profession);
        formData.append('company', company);
        if (photo) {
            formData.append('profile_picture', photo);
        }

        try {
            const response = await axios.put(`${config.BASE_URL}/api/users/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                setSuccess('Profile updated successfully!');
            } else {
                setError('Profile update failed. Please try again.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message === 'Username should be unique') {
                setError('Choose a unique username');
            } else {
                setError('Profile update failed. Please try again.');
            }
        }
    };

    const handleEditClick = (field) => {
        setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="w-100">
                <h2 className="text-center mb-4">Edit Profile</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingFirstName" label="First Name" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={firstname}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        readOnly={!editableFields.firstname}
                                        required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('firstname')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingLastName" label="Last Name" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastname}
                                        onChange={(e) => setLastName(e.target.value)}
                                        readOnly={!editableFields.lastname}
                                        required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('lastname')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingUsername" label="Username" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        readOnly={!editableFields.username}
                                        required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('username')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                        <Col md={6}>
                            <FloatingLabel controlId="floatingEmail" label="Email address" className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    readOnly
                                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingBio" label="Bio" className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        readOnly={!editableFields.bio}
                                        required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('bio')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingGender" label="Gender" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        readOnly={!editableFields.gender}
                                        required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('gender')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingHobbies" label="Hobbies" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Hobbies"
                                        value={hobbies}
                                        onChange={(e) => setHobbies(e.target.value)}
                                        readOnly={!editableFields.hobbies}
                                        // required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('hobbies')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                                <div className="input-with-icon">
                                   <FloatingLabel controlId="floatingProfession" label="Profession" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Profession"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        readOnly={!editableFields.profession}
                                        // required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('profession')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                        <Col md={6}>
                                <div className="input-with-icon">
                                    <FloatingLabel controlId="floatingCompany" label="Company" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Company"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        readOnly={!editableFields.company}
                                        // required
                                    />
                                    <Button variant="link" className="edit-icon" onClick={() => handleEditClick('company')}>
                                        <PencilSquare />
                                    </Button>
                                    </FloatingLabel>
                                </div>
                        </Col>
                    </Row>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload Photo</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => validatePhoto(e.target.files[0])}
                        />
                    </Form.Group>
                    <Button type="submit" className="w-100" variant="primary">Update Profile</Button>
                </Form>
            </div>
        </Container>
    );
};

export default EditProfile;