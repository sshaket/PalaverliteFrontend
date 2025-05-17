// src/config.js
const config = {
    BASE_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000'
};

export default config;
