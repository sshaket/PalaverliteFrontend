import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const ViewProfile = () => {
    const [user, setUser] = useState(null);
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in local storage after login

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${config.BASE_URL}/api/users/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <h2>{user.firstname} {user.lastname}'s Profile</h2>
            <div className="card">
                <img src={user.profile_picture} alt="Profile" className="card-img-top" />
                <div className="card-body">
                    <h5 className="card-title">{user.username}</h5>
                    <p className="card-text">Email: {user.email}</p>
                    <a href={`/profile/edit/${userId}`} className="btn btn-primary">Edit Profile</a>
                </div>
            </div>
        </div>
    );
};

export default ViewProfile;