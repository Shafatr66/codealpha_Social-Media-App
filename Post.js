import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import { likePost, fetchComments } from '../js/api';

const Post = ({ post, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const loadComments = async () => {
            const fetchedComments = await fetchComments(post.id);
            setComments(fetchedComments);
        };
        loadComments();
    }, [post.id]);

    const handleLike = async () => {
        await likePost(post.id, user.id);
        // Optionally, you can update the post state to reflect the new like count
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        // Add logic to submit the new comment
        setNewComment('');
    };

    return (
        <div className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={handleLike}>Like</button>
            <div className="comments">
                {comments.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </div>
            <form onSubmit={handleCommentSubmit}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Post;