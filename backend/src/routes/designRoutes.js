const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification

// @route   POST /api/designs
// @desc    Sauvegarder un nouveau design
// @access  Private
router.post('/', authMiddleware, designController.saveDesign);

// @route   GET /api/designs
// @desc    Récupérer tous mes designs
// @access  Private
router.get('/', authMiddleware, designController.getMyDesigns);

// @route   GET /api/designs/:id
// @desc    Récupérer un design par ID
// @access  Private
router.get('/:id', authMiddleware, designController.getDesignById);

// @route   PUT /api/designs/:id
// @desc    Mettre à jour un design
// @access  Private
router.put('/:id', authMiddleware, designController.updateDesign);

// @route   DELETE /api/designs/:id
// @desc    Supprimer un design
// @access  Private
router.delete('/:id', authMiddleware, designController.deleteDesign);

module.exports = router;