const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Routes utilisateur (nécessitent une authentification)

// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Private
router.post('/', authMiddleware, orderController.createOrder);

// @route   GET /api/orders/my
// @desc    Récupérer mes commandes
// @access  Private
router.get('/my', authMiddleware, orderController.getMyOrders);

// @route   GET /api/orders/:id
// @desc    Récupérer une commande par ID
// @access  Private
router.get('/:id', authMiddleware, orderController.getOrderById);

// Routes admin (nécessitent authentification + rôle admin)

// @route   GET /api/orders/admin/all
// @desc    Récupérer toutes les commandes
// @access  Private/Admin
router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);

// @route   PUT /api/orders/:id/status
// @desc    Mettre à jour le statut d'une commande
// @access  Private/Admin
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
