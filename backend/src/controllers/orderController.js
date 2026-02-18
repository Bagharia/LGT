const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { designs, totalPrice, type, productId, quantities } = req.body;
    const userId = req.user.userId;

    console.log('📦 Création commande pour userId:', userId);
    console.log('📦 Type:', type || 'custom');
    console.log('📦 Designs reçus:', JSON.stringify(designs, null, 2));
    console.log('📦 Prix total:', totalPrice);

    // Vérifier minimum articles pour comptes pro
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { accountType: true } });
    if (user?.accountType === 'pro') {
      let totalArticles = 0;
      if (type === 'ready-made' && quantities) {
        totalArticles = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
      } else if (designs && Array.isArray(designs)) {
        for (const d of designs) {
          if (d.quantities) {
            totalArticles += Object.values(d.quantities).reduce((sum, qty) => sum + qty, 0);
          }
        }
      }
      if (totalArticles < 20) {
        return res.status(400).json({ error: 'Les comptes professionnels doivent commander au minimum 20 articles' });
      }
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: userId,
        totalPrice: totalPrice,
        status: 'PENDING',
        shippingAddress: 'A définir',
        shippingCity: 'A définir',
        shippingZip: '00000',
        shippingCountry: 'France'
      }
    });

    if (type === 'ready-made' && productId) {
      // Commande de produit fini (sans design personnalisé)
      // Créer un design "vide" lié au produit pour le OrderDesign
      const design = await prisma.design.create({
        data: {
          userId: userId,
          productId: parseInt(productId),
          frontDesignJson: '{"objects":[]}',
          name: 'Produit fini',
          quantities: quantities,
          totalPrice: totalPrice,
          finalPrice: totalPrice
        }
      });

      await prisma.orderDesign.create({
        data: {
          orderId: order.id,
          designId: design.id,
          quantities: quantities || {},
          finalPrice: totalPrice
        }
      });
    } else if (designs && Array.isArray(designs) && designs.length > 0) {
      // Commande avec designs personnalisés
      for (const designData of designs) {
        await prisma.orderDesign.create({
          data: {
            orderId: order.id,
            designId: designData.designId,
            quantities: designData.quantities,
            finalPrice: designData.finalPrice
          }
        });
      }
    } else {
      // Ni ready-made ni designs fournis
      await prisma.order.delete({ where: { id: order.id } });
      return res.status(400).json({ error: 'Au moins un design ou produit est requis' });
    }

    // Récupérer la commande complète
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderDesigns: {
          include: {
            design: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Commande créée avec succès, ID:', order.id);

    res.status(201).json({
      message: 'Commande créée avec succès',
      order: completeOrder
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

// @desc    Récupérer toutes les commandes de l'utilisateur
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('📋 Récupération commandes pour userId:', userId);

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        orderDesigns: {
          include: {
            design: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les commandes pour le frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      designs: order.orderDesigns.map(od => ({
        id: od.design.id,
        name: od.design.name,
        frontPreviewUrl: od.design.frontPreviewUrl,
        backPreviewUrl: od.design.backPreviewUrl,
        quantities: od.quantities,
        finalPrice: od.finalPrice,
        product: od.design.product
      }))
    }));

    console.log('📋 Nombre de commandes trouvées:', orders.length);

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes', details: error.message });
  }
};

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
      include: {
        orderDesigns: {
          include: {
            design: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Formater pour le frontend
    const formattedOrder = {
      id: order.id,
      userId: order.userId,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      designs: order.orderDesigns.map(od => ({
        id: od.design.id,
        name: od.design.name,
        frontPreviewUrl: od.design.frontPreviewUrl,
        backPreviewUrl: od.design.backPreviewUrl,
        quantities: od.quantities,
        finalPrice: od.finalPrice,
        product: od.design.product
      }))
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
};

// @desc    Récupérer toutes les commandes (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        orderDesigns: {
          include: {
            design: {
              include: {
                product: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les commandes pour le frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      user: order.user,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingZip: order.shippingZip,
      shippingCountry: order.shippingCountry,
      designs: order.orderDesigns.map(od => ({
        id: od.design.id,
        name: od.design.name,
        frontPreviewUrl: od.design.frontPreviewUrl,
        backPreviewUrl: od.design.backPreviewUrl,
        frontDesignJson: od.design.frontDesignJson,
        backDesignJson: od.design.backDesignJson,
        tshirtColor: od.design.tshirtColor,
        posterImageUrl: od.design.posterImageUrl,
        frameColor: od.design.frameColor,
        posterFormat: od.design.posterFormat,
        quantities: od.quantities,
        finalPrice: od.finalPrice,
        product: od.design.product
      }))
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

// @desc    Mettre à jour le statut d'une commande (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    // Vérifier que le statut est valide (en majuscule comme dans le schema Prisma)
    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const upperStatus = status.toUpperCase();

    if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: upperStatus },
      include: {
        orderDesigns: {
          include: {
            design: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Statut de la commande mis à jour',
      order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};
