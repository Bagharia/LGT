const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Routes publiques
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);

// Routes admin (AVANT /:id pour éviter le conflit Express)
router.get('/admin/all', authMiddleware, adminMiddleware, productController.getAllProductsAdmin);
router.put('/reorder', authMiddleware, adminMiddleware, productController.reorderProducts);

// Route publique par ID
router.get('/:id', productController.getProductById);

// Routes Reviews (sous-ressource de produit)
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', authMiddleware, reviewController.createReview);
router.delete('/:productId/reviews/:reviewId', authMiddleware, adminMiddleware, reviewController.deleteReview);

// Routes admin CRUD
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.patch('/:id/featured', authMiddleware, adminMiddleware, productController.toggleFeatured);

module.exports = router;
