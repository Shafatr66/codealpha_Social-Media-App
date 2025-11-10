const User = require('../models/userModel');

// Fetch user profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Follow a user
exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentUser.following.includes(userToFollow._id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({ message: 'You are now following this user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        currentUser.following.pull(userToUnfollow._id);
        userToUnfollow.followers.pull(currentUser._id);

        await currentUser.save();
        await userToUnfollow.save();

        res.status(200).json({ message: 'You have unfollowed this user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};