const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));
router.get('/user-details', authMiddleware, authController.getUserDetails.bind(authController));
router.put('/user-details', authMiddleware, authController.updateUserDetails.bind(authController));

module.exports = router;
