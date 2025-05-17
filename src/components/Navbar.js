import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { HouseFill } from 'react-bootstrap-icons';
import '../styles/Navbar.css';
import logo from '../images/logo.png'; // Import the logo
import axios from 'axios';
import config from '../config';
import io from 'socket.io-client';

const socket = io(config.SOCKET_URL);
const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [profilePic, setProfilePic] = useState('');
    const [isDefaultProfilePic, setIsDefaultProfilePic] = useState(false);

    useEffect(() => {
        const fetchProfilePic = async () => {
            if (isAuthenticated) {
                const userId = localStorage.getItem('userId');
                try {
                    const response = await axios.get(`${config.BASE_URL}/api/users/${userId}`);
                    if (response.data.profile_picture) {
                        // const useS3 = process.env.USE_S3 === 'true';
                        const profilePicture = response.data.profile_picture;
                        console.log('Profile Picture in IF condition:', profilePicture);
                        if (process.env.REACT_APP_USE_S3 === 'true') {
                            // Use S3 URL directly
                            console.log('Profile Picture in IF condition of IF condition:', profilePicture);
                            setProfilePic(`https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${profilePicture}`);
                        } else {
                            // Use local uploads path
                            setProfilePic(`${config.BASE_URL}/uploads/${profilePicture}`);
                        }
                        // setProfilePic(`${config.BASE_URL}/uploads/${profilePicture}`);
                        setIsDefaultProfilePic(profilePicture === 'man.png' || profilePicture === 'woman.png');
                    } else {
                        const defaultProfilePic = response.data.gender === 'male' ? 'man.png' : 'woman.png';
                        console.log('Profile Picture in Else Condition:', profilePicture);
                        setProfilePic(`${config.BASE_URL}/uploads/${defaultProfilePic}`);
                        setIsDefaultProfilePic(true);
                    }
                } catch (error) {
                    console.error('Error fetching profile picture:', error);
                    console.log('Profile Picture in Error Condition:', profilePicture);
                    setProfilePic(`${config.BASE_URL}/uploads/default_profile_pic.jpg`); // Set a default profile picture in case of error
                }
            }
        };

        socket.on('profilePictureUpdated', ({ userId: updatedUserId, profilePicture }) => {
            if (updatedUserId === localStorage.getItem('userId')) {
                if (process.env.REACT_APP_USE_S3 === 'true') {
                    // Use S3 URL directly
                    setProfilePic(`https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${profilePicture}`);
                } else {
                    // Use local uploads path
                    setProfilePic(`${config.BASE_URL}/uploads/${profilePicture}`);
                }
                setIsDefaultProfilePic(profilePicture === 'man.png' || profilePicture === 'woman.png');
            }
        });

        fetchProfilePic();

        return () => {
            socket.off('profilePictureUpdated');
        };
    }, [isAuthenticated]);

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('userId'); // Clear user data from local storage
        localStorage.removeItem('token'); // Clear token from local storage
        navigate('/'); // Redirect to Home page
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-custom">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <img src={logo} alt="PalaverLite Logo" className="navbar-logo" />
                </NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item nav-item-spacing">
                                    <NavLink className="nav-link" to="/">
                                        <HouseFill /> Home
                                    </NavLink>
                                </li>
                                <li className="nav-item nav-item-spacing">
                                    <NavLink className="nav-link" to="/feed">Feed</NavLink>
                                </li>
                                <li className="nav-item nav-item-spacing">
                                    <NavLink className="nav-link" to="/posts">Posts</NavLink>
                                </li>
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img
                                            src={profilePic}
                                            alt="Profile"
                                            className={`rounded-circle ${isDefaultProfilePic ? 'default-profile-pic' : ''}`}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                        <li>
                                            <NavLink className="dropdown-item" to="/profile/edit">Edit Profile</NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="dropdown-item" to="/" onClick={handleLogout}>Logout</NavLink>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item nav-item-spacing">
                                    <NavLink className="nav-link" to="/login">Login</NavLink>
                                </li>
                                <li className="nav-item nav-item-spacing">
                                    <NavLink className="nav-link" to="/signup">Sign Up</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
