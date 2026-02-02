const { cloudinary } = require('../middlewares/uploadMiddleware');

// Upload d'une image produit
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    // Cloudinary retourne automatiquement l'URL optimisée
    const result = {
      url: req.file.path,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
    };

    res.json({
      success: true,
      image: result,
    });
  } catch (error) {
    console.error('Erreur upload image produit:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
};

// Upload d'une image de design
const uploadDesignImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const result = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    res.json({
      success: true,
      image: result,
    });
  } catch (error) {
    console.error('Erreur upload image design:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
};

// Supprimer une image de Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID requis' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image supprimée' });
    } else {
      res.status(400).json({ error: 'Impossible de supprimer l\'image' });
    }
  } catch (error) {
    console.error('Erreur suppression image:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
};

module.exports = {
  uploadProductImage,
  uploadDesignImage,
  deleteImage,
};
