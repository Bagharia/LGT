const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Routes publiques
router.get('/', categoryController.getAllCategories);

// Routes admin (AVANT /:id pour éviter le conflit Express)
router.get('/admin/all', authMiddleware, adminMiddleware, categoryController.getAllCategoriesAdmin);
router.put('/reorder', authMiddleware, adminMiddleware, categoryController.reorderCategories);

// Routes admin CRUD
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;
