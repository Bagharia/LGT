const express = require('express');
const router = express.Router();
const { uploadProductImage, uploadDesignImage } = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Route pour upload d'image produit (admin uniquement)
router.post(
  '/product',
  authMiddleware,
  adminMiddleware,
  uploadProductImage.single('image'),
  uploadController.uploadProductImage
);

// Route pour upload d'image design (utilisateur connecté)
router.post(
  '/design',
  authMiddleware,
  uploadDesignImage.single('image'),
  uploadController.uploadDesignImage
);

// Route pour supprimer une image (admin uniquement)
router.delete(
  '/delete',
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage
);

module.exports = router;
