const Comment = require('../models/commentModel');

// Add a new comment to a post
exports.addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const newComment = new Comment({
            postId,
            userId: req.user.id,
            content,
            createdAt: new Date()
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
};

// Fetch comments for a specific post
exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId }).populate('userId', 'username');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        await comment.remove();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};