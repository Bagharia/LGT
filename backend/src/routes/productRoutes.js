const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Routes publiques
router.get('/', productController.getAllProducts);

// Routes admin (AVANT /:id pour éviter le conflit Express)
router.get('/admin/all', authMiddleware, adminMiddleware, productController.getAllProductsAdmin);
router.put('/reorder', authMiddleware, adminMiddleware, productController.reorderProducts);

// Route publique par ID
router.get('/:id', productController.getProductById);

// Routes admin CRUD
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
