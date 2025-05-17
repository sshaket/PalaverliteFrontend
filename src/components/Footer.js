import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer bg-light text-center py-2">
            <div className="container">
                <p className="mb-2">Developed by Shaket Sharma</p>
                <p className="mb-0">&copy; {new Date().getFullYear()} PalaverLite. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;