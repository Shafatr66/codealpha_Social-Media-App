const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get a user by ID
router.get('/:id', userController.getUserById);

// Route to update a user by ID
router.put('/:id', userController.updateUser);

// Route to delete a user by ID
router.delete('/:id', userController.deleteUser);

// Route to follow a user
router.post('/:id/follow', userController.followUser);

// Route to unfollow a user
router.post('/:id/unfollow', userController.unfollowUser);

module.exports = router;