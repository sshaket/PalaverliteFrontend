import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import io from 'socket.io-client';

const socket = io(config.BASE_URL);

const UserProfileSidebar = () => {
    const [userData, setUserData] = useState({});
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${config.BASE_URL}/api/users/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();

        socket.on('profilePictureUpdated', ({ userId: updatedUserId, profilePicture }) => {
            if (updatedUserId === userId) {
                setUserData(prevData => ({
                    ...prevData,
                    profile_picture: profilePicture
                }));
            }
        });

        return () => {
            socket.off('profilePictureUpdated');
        };
    }, [userId]);

    return (
        <Card className="mb-4">
            <Card.Body className="text-center">
                <img
                    src={
                        process.env.REACT_APP_USE_S3 === 'true'
                            ? `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${userData.profile_picture || 'default_profile_pic.jpg'}`
                            : `${config.BASE_URL}/uploads/${userData.profile_picture || 'default_profile_pic.jpg'}`
                    }
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h4>{`${userData.firstname} ${userData.lastname}`}</h4>
                <p>{userData.email}</p>
                <p>{userData.bio || 'Add your bio to display it here on your profile'}</p>
            </Card.Body>
        </Card>
    );
};

export default UserProfileSidebar;