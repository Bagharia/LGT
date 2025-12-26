const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Routes publiques (pas besoin de token)

// @route   GET /api/products
// @desc    Récupérer tous les produits actifs
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
router.get('/:id', productController.getProductById);

// Routes admin (nécessitent token + role ADMIN)

// @route   GET /api/products/admin/all
// @desc    Récupérer TOUS les produits (actifs et inactifs)
// @access  Private/Admin
router.get('/admin/all', authMiddleware, adminMiddleware, productController.getAllProductsAdmin);

// @route   POST /api/products
// @desc    Créer un nouveau produit
// @access  Private/Admin
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Désactiver un produit
// @access  Private/Admin
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;