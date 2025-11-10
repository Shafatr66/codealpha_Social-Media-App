const apiUrl = 'http://localhost:5000/api'; // Change this to your backend URL

// Function to fetch user profile
export const fetchUserProfile = async (userId) => {
    try {
        const response = await fetch(`${apiUrl}/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

// Function to fetch posts
export const fetchPosts = async () => {
    try {
        const response = await fetch(`${apiUrl}/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

// Function to create a new post
export const createPost = async (postData) => {
    try {
        const response = await fetch(`${apiUrl}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

// Function to add a comment to a post
export const addComment = async (postId, commentData) => {
    try {
        const response = await fetch(`${apiUrl}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
        });
        if (!response.ok) {
            throw new Error('Failed to add comment');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

// Function to like a post
export const likePost = async (postId) => {
    try {
        const response = await fetch(`${apiUrl}/posts/${postId}/like`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to like post');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

// Function to follow a user
export const followUser = async (userId) => {
    try {
        const response = await fetch(`${apiUrl}/users/${userId}/follow`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to follow user');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
};