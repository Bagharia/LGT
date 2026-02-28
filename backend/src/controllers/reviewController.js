const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    if (!rating || parseInt(rating) < 1 || parseInt(rating) > 5) {
      return res.status(400).json({ error: 'La note doit être un entier entre 1 et 5' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      update: { rating: parseInt(rating), comment: comment?.trim() || null },
      create: { userId, productId, rating: parseInt(rating), comment: comment?.trim() || null },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ message: 'Avis enregistré avec succès', review });
  } catch (error) {
    console.error('Erreur createReview:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    const averageRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.json({ reviews, averageRating, count: reviews.length });
  } catch (error) {
    console.error('Erreur getProductReviews:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteReview:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
