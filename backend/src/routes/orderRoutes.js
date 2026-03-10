const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/orders
// @access  Public (guest) or Private (logged in)
router.post('/', optionalAuthMiddleware, orderController.createOrder);

// @route   GET /api/orders/my
// @access  Private
router.get('/my', authMiddleware, orderController.getMyOrders);

// @route   POST /api/orders/track
// @access  Public — doit être avant /:id pour éviter le conflit Express
router.post('/track', orderController.trackOrder);

// @route   GET /api/orders/admin/all
// @access  Private/Admin — doit être avant /:id pour éviter le conflit Express
router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);

// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// @route   GET /api/orders/:id
// @access  Public (guest with token) or Private
router.get('/:id', optionalAuthMiddleware, orderController.getOrderById);

module.exports = router;
