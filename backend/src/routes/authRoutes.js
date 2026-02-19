const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

// @route   POST /api/auth/change-password
router.post('/change-password', authMiddleware, authController.changePassword);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
