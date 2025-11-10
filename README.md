# Mini Social App

## Overview
This is a mini social media application that allows users to create profiles, make posts, comment on posts, and follow other users. The application is built with a frontend using HTML, CSS, and JavaScript, and a backend using Express.js. 

## Features
- User authentication (registration and login)
- User profiles with personal information and posts
- Ability to create, edit, and delete posts
- Commenting on posts
- Like functionality for posts
- Follow/unfollow other users

## Project Structure
```
mini-social-app
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── css
│   │   │   └── styles.css
│   │   ├── js
│   │   │   ├── main.js
│   │   │   └── api.js
│   │   └── components
│   │       ├── Header.js
│   │       ├── Feed.js
│   │       ├── Post.js
│   │       ├── Comment.js
│   │       └── Profile.js
│   └── package.json
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   └── commentController.js
│   │   ├── models
│   │   │   ├── userModel.js
│   │   │   ├── postModel.js
│   │   │   └── commentModel.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   └── posts.js
│   │   ├── middleware
│   │   │   └── auth.js
│   │   └── config
│   │       └── db.js
│   ├── package.json
│   └── .env.example
├── tests
│   ├── frontend
│   │   └── ui.test.js
│   └── backend
│       └── api.test.js
├── .gitignore
└── README.md
```

## Setup Instructions

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies using npm:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies using npm:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file and configure your environment variables.
4. Start the backend server:
   ```
   node src/app.js
   ```

## Usage
- Visit the frontend application in your browser to register or log in.
- Create posts, comment on them, and interact with other users by following them.

## Testing
- Frontend tests can be run from the `tests/frontend` directory.
- Backend tests can be run from the `tests/backend` directory.

## Contributing
Feel free to fork the repository and submit pull requests for any improvements or features you'd like to add.