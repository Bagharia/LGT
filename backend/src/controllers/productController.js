const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @route   GET /api/products
// @desc    Récupérer tous les produits actifs
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
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
      where: { id: parseInt(id) }
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
      mockupBackUrl 
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
        isActive: true
      }
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
      isActive 
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

    // Mettre à jour le produit
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
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

// @route   GET /api/products/admin/all
// @desc    Récupérer TOUS les produits (actifs et inactifs) (Admin seulement)
// @access  Private/Admin
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
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