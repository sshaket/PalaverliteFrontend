# PalaverLite

PalaverLite is a lightweight social media platform that allows users to create profiles, post messages, and view feeds. This project is built using React for the frontend, Express.js for the backend, and SQL for the database. It is designed to be responsive and user-friendly, utilizing the latest Bootstrap framework for an attractive UI.

## Key Features

- **User Authentication**: Secure account creation and login functionality.
- **Profile Management**: Users can create and edit their profiles, including profile pictures.
- **Post Creation and Viewing**: Users can create posts and view posts from other users on their feed.
- **Basic Security Measures**: Encrypted connections (HTTPS) and password hashing for user authentication.

## Technologies Used

- React (Function-based components)
- Bootstrap (for responsive design)
- Express.js (backend)
- SQL (database)
- Node.js (v23.7.0)

## Project Structure

```
PalaverLite
├── public
│   ├── index.html
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── Auth
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Profile
│   │   │   ├── EditProfile.js
│   │   │   └── ViewProfile.js
│   │   ├── Post
│   │   │   ├── CreatePost.js
│   │   │   └── ViewPosts.js
│   │   ├── Feed.js
│   │   └── Navbar.js
│   ├── App.js
│   ├── index.js
│   └── styles
│       └── main.css
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd PalaverLite
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your environment variables, such as API endpoints and secret keys.

4. **Run the Application**:
   ```
   npm start
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to view the application.

## Deployment

This project can be deployed to AWS using services such as AWS Amplify or Elastic Beanstalk. Follow the respective documentation for deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.