import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import EditProfile from './components/Profile/EditProfile';
import ViewProfile from './components/Profile/ViewProfile';
import CreatePost from './components/Post/CreatePost';
import ViewPosts from './components/Post/ViewPosts';
import Home from './components/Home';
import ViewFeed from './components/Feed/Feed';
import Footer from './components/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.css';

const AppContent = ({ isAuthenticated, setIsAuthenticated }) => {
    const location = useLocation();
    const isSignupPage = location.pathname === '/signup';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, [setIsAuthenticated]);

    return (
        <div className={`d-flex flex-column min-vh-100 ${isSignupPage ? 'signup-background' : ''}`}>
            <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-grow-1" style={{ paddingTop: '80px', paddingBottom: '56px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/profile/edit" element={<PrivateRoute isAuthenticated={isAuthenticated}><EditProfile /></PrivateRoute>} />
                    <Route path="/profile/view" element={<PrivateRoute isAuthenticated={isAuthenticated}><ViewProfile /></PrivateRoute>} />
                    <Route path="/post/create" element={<PrivateRoute isAuthenticated={isAuthenticated}><CreatePost /></PrivateRoute>} />
                    <Route path="/posts" element={<PrivateRoute isAuthenticated={isAuthenticated}><ViewPosts /></PrivateRoute>} />
                    <Route path="/feed" element={<PrivateRoute isAuthenticated={isAuthenticated}><ViewFeed /></PrivateRoute>} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Router>
            <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Router>
    );
}

export default App;