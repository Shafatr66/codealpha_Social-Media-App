const { body, validationResult } = require('express-validator');

const validateUserRegistration = [
    body('username')
        .isString()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long.'),
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address.'),
    body('password')
        .isString()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address.'),
    body('password')
        .isString()
        .withMessage('Password is required.'),
];

const validatePostCreation = [
    body('title')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Title is required.'),
    body('content')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Content is required.'),
];

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validatePostCreation,
    validateRequest,
};