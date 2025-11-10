const express = require('express');
const PostsController = require('../controllers/postsController');

const router = express.Router();
const postsController = new PostsController();

// Route to create a new post
router.post('/', postsController.createPost.bind(postsController));

// Route to get all posts
router.get('/', postsController.getAllPosts.bind(postsController));

// Route to get a single post by ID
router.get('/:id', postsController.getPostById.bind(postsController));

// Route to update a post by ID
router.put('/:id', postsController.updatePost.bind(postsController));

// Route to delete a post by ID
router.delete('/:id', postsController.deletePost.bind(postsController));

module.exports = router;