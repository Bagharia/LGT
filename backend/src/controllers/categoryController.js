const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @route   GET /api/categories
// @desc    Récupérer toutes les catégories actives avec leurs produits
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

// @route   GET /api/categories/admin/all
// @desc    Récupérer toutes les catégories (actives et inactives)
// @access  Private/Admin
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

// @route   POST /api/categories
// @desc    Créer une nouvelle catégorie
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, hasTwoSides, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const categorySlug = slug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        hasTwoSides: hasTwoSides !== undefined ? hasTwoSides : true,
        displayOrder: displayOrder || 0,
        isActive: true
      }
    });

    res.status(201).json({ message: 'Catégorie créée avec succès', category });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce nom ou slug existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};

// @route   PUT /api/categories/:id
// @desc    Mettre à jour une catégorie
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, hasTwoSides, displayOrder, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      if (!slug) {
        updateData.slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      }
    }
    if (slug !== undefined) updateData.slug = slug;
    if (hasTwoSides !== undefined) updateData.hasTwoSides = hasTwoSides;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Catégorie mise à jour avec succès', category });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce nom ou slug existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie' });
  }
};

// @route   DELETE /api/categories/:id
// @desc    Supprimer une catégorie (interdit si des produits sont liés)
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({ where: { categoryId: parseInt(id) } });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer : ${productCount} produit(s) sont liés à cette catégorie`
      });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
  }
};

// @route   PUT /api/categories/reorder
// @desc    Réordonner les catégories
// @access  Private/Admin
exports.reorderCategories = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Liste des items requise' });
    }

    await prisma.$transaction(
      items.map(item =>
        prisma.category.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder }
        })
      )
    );

    res.json({ message: 'Ordre mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du réordonnement:', error);
    res.status(500).json({ error: 'Erreur lors du réordonnement des catégories' });
  }
};
