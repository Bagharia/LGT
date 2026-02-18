const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @route   POST /api/designs
// @desc    Sauvegarder un nouveau design
// @access  Private
exports.saveDesign = async (req, res) => {
  try {
    const {
      productId,
      frontDesignJson,
      backDesignJson,
      frontPreviewUrl,
      backPreviewUrl,
      name,
      quantities,
      totalPrice,
      finalPrice,
      tshirtColor,
      posterImageUrl,
      frameColor,
      posterFormat
    } = req.body;

    // Validation
    if (!productId || (!frontDesignJson && !posterImageUrl)) {
      return res.status(400).json({
        error: 'ProductId et frontDesignJson (ou posterImageUrl) sont requis'
      });
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Créer le design
    const design = await prisma.design.create({
      data: {
        userId: req.user.userId,
        productId: parseInt(productId),
        frontDesignJson: frontDesignJson || null,
        backDesignJson: backDesignJson || null,
        frontPreviewUrl: frontPreviewUrl || null,
        backPreviewUrl: backPreviewUrl || null,
        name: name || 'Mon design',
        quantities: quantities || null,
        totalPrice: totalPrice || null,
        finalPrice: finalPrice || null,
        tshirtColor: tshirtColor || null,
        posterImageUrl: posterImageUrl || null,
        frameColor: frameColor || null,
        posterFormat: posterFormat || null
      },
      include: {
        product: true
      }
    });

    res.status(201).json({
      message: 'Design sauvegardé avec succès',
      design
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du design:', error);
    res.status(500).json({
      error: 'Erreur lors de la sauvegarde du design'
    });
  }
};

// @route   GET /api/designs
// @desc    Récupérer tous les designs de l'utilisateur connecté
// @access  Private
exports.getMyDesigns = async (req, res) => {
  try {
    const designs = await prisma.design.findMany({
      where: { userId: req.user.userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      count: designs.length,
      designs
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des designs:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des designs'
    });
  }
};

// @route   GET /api/designs/:id
// @desc    Récupérer un design par son ID
// @access  Private
exports.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;

    const design = await prisma.design.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true
      }
    });

    if (!design) {
      return res.status(404).json({
        error: 'Design non trouvé'
      });
    }

    // Vérifier que le design appartient à l'utilisateur
    if (design.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Accès refusé à ce design'
      });
    }

    res.json({ design });

  } catch (error) {
    console.error('Erreur lors de la récupération du design:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du design'
    });
  }
};

// @route   PUT /api/designs/:id
// @desc    Mettre à jour un design
// @access  Private
exports.updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      frontDesignJson,
      backDesignJson,
      frontPreviewUrl,
      backPreviewUrl,
      name,
      quantities,
      totalPrice,
      finalPrice,
      tshirtColor,
      posterImageUrl,
      frameColor,
      posterFormat
    } = req.body;

    // Vérifier que le design existe et appartient à l'utilisateur
    const existingDesign = await prisma.design.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDesign) {
      return res.status(404).json({
        error: 'Design non trouvé'
      });
    }

    if (existingDesign.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Accès refusé à ce design'
      });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (frontDesignJson !== undefined) updateData.frontDesignJson = frontDesignJson;
    if (backDesignJson !== undefined) updateData.backDesignJson = backDesignJson;
    if (frontPreviewUrl !== undefined) updateData.frontPreviewUrl = frontPreviewUrl;
    if (backPreviewUrl !== undefined) updateData.backPreviewUrl = backPreviewUrl;
    if (name !== undefined) updateData.name = name;
    if (quantities !== undefined) updateData.quantities = quantities;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (tshirtColor !== undefined) updateData.tshirtColor = tshirtColor;
    if (posterImageUrl !== undefined) updateData.posterImageUrl = posterImageUrl;
    if (frameColor !== undefined) updateData.frameColor = frameColor;
    if (posterFormat !== undefined) updateData.posterFormat = posterFormat;

    // Mettre à jour le design
    const design = await prisma.design.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        product: true
      }
    });

    res.json({
      message: 'Design mis à jour avec succès',
      design
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du design:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du design'
    });
  }
};

// @route   DELETE /api/designs/:id
// @desc    Supprimer un design
// @access  Private
exports.deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le design existe et appartient à l'utilisateur
    const existingDesign = await prisma.design.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDesign) {
      return res.status(404).json({
        error: 'Design non trouvé'
      });
    }

    if (existingDesign.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Accès refusé à ce design'
      });
    }

    // Supprimer le design
    await prisma.design.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Design supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du design:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du design'
    });
  }
};
