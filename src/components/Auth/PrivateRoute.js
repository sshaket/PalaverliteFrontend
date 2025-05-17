import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated, children }) => {
    const token = localStorage.getItem('token');
    return isAuthenticated || token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;