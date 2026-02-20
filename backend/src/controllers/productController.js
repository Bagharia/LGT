const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @route   GET /api/products
// @desc    Récupérer tous les produits actifs
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: true }
    });

    res.json({
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    });
  }
};

// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    res.json({ product });

  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    });
  }
};

// @route   POST /api/products
// @desc    Créer un nouveau produit (Admin seulement)
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      mockupFrontUrl,
      mockupBackUrl,
      categoryId,
      displayOrder
    } = req.body;

    // Validation
    if (!name || !basePrice) {
      return res.status(400).json({
        error: 'Nom et prix sont requis'
      });
    }

    if (basePrice <= 0) {
      return res.status(400).json({
        error: 'Le prix doit être supérieur à 0'
      });
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        basePrice: parseFloat(basePrice),
        mockupFrontUrl: mockupFrontUrl || null,
        mockupBackUrl: mockupBackUrl || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        displayOrder: displayOrder || 0,
        isActive: true
      },
      include: { category: true }
    });

    res.status(201).json({
      message: 'Produit créé avec succès',
      product
    });

  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du produit'
    });
  }
};

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit (Admin seulement)
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      basePrice,
      mockupFrontUrl,
      mockupBackUrl,
      isActive,
      categoryId,
      displayOrder
    } = req.body;

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) {
      if (basePrice <= 0) {
        return res.status(400).json({
          error: 'Le prix doit être supérieur à 0'
        });
      }
      updateData.basePrice = parseFloat(basePrice);
    }
    if (mockupFrontUrl !== undefined) updateData.mockupFrontUrl = mockupFrontUrl;
    if (mockupBackUrl !== undefined) updateData.mockupBackUrl = mockupBackUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    // Mettre à jour le produit
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true }
    });

    res.json({
      message: 'Produit mis à jour avec succès',
      product
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du produit'
    });
  }
};

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit (désactivation) (Admin seulement)
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Désactiver le produit plutôt que de le supprimer
    // (pour garder l'historique des commandes)
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({
      message: 'Produit désactivé avec succès',
      product
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du produit'
    });
  }
};

// @route   GET /api/products/featured
// @desc    Récupérer les produits vedette (homepage)
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: true }
    });

    res.json({ products });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits vedette:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits vedette' });
  }
};

// @route   PATCH /api/products/:id/featured
// @desc    Basculer le statut vedette d'un produit (Admin)
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isFeatured: !existing.isFeatured },
      include: { category: true }
    });

    res.json({ message: 'Statut vedette mis à jour', product });
  } catch (error) {
    console.error('Erreur toggleFeatured:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// @route   GET /api/products/admin/all
// @desc    Récupérer TOUS les produits (actifs et inactifs) (Admin seulement)
// @access  Private/Admin
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: true }
    });

    res.json({
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    });
  }
};

// @route   PUT /api/products/reorder
// @desc    Réordonner les produits
// @access  Private/Admin
exports.reorderProducts = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Liste des items requise' });
    }

    await prisma.$transaction(
      items.map(item =>
        prisma.product.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder }
        })
      )
    );

    res.json({ message: 'Ordre mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du réordonnement:', error);
    res.status(500).json({ error: 'Erreur lors du réordonnement des produits' });
  }
};
