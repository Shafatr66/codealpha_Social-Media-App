const Post = require('../models/postModel');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const post = new Post({
            user: req.user.id,
            content: req.body.content,
            likes: [],
            comments: []
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'username').populate('comments.user', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await post.remove();
        res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
};