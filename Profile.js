import React, { useEffect, useState } from 'react';
import { getUserProfile, getUserPosts } from '../js/api';
import Post from './Post';

const Profile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const userProfile = await getUserProfile(userId);
            setUser(userProfile);
        };

        const fetchUserPosts = async () => {
            const userPosts = await getUserPosts(userId);
            setPosts(userPosts);
        };

        fetchUserProfile();
        fetchUserPosts();
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile">
            <h1>{user.username}'s Profile</h1>
            <p>Followers: {user.followers.length}</p>
            <p>Following: {user.following.length}</p>
            <h2>Posts</h2>
            <div className="posts">
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default Profile;