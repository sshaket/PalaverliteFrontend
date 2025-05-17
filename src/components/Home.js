import React from 'react';
import bodyImage from '../images/body.png'; // Import the image

const Home = () => {
    return (
        <div className="container mt-4 feed-container">
            <div className="welcome-section">
                <h2 className="text-left">Welcome to PALAVERLITE</h2>
                <img src={bodyImage} alt="Body" className="body-image" />
            </div>
        </div>
    );
};

export default Home;