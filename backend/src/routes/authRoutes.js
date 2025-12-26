const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
// @desc    Créer un nouveau compte
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Connexion
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Obtenir les infos de l'utilisateur connecté
// @access  Private (token requis)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;