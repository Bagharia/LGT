const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configuration du stockage Cloudinary pour les images produits
// Pas de transformation à l'upload - on garde l'original en haute qualité
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lgt-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Pas de transformation = qualité originale conservée
  },
});

// Configuration pour les images de design utilisateur
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lgt-designs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Pas de transformation = qualité originale conservée
  },
});

// Filtre pour accepter uniquement les images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.'), false);
  }
};

// Middleware pour upload d'images produits (max 5MB)
const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware pour upload d'images design (max 10MB)
const uploadDesignImage = multer({
  storage: designStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = {
  uploadProductImage,
  uploadDesignImage,
  cloudinary,
};
