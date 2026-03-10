const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const getResend = () => new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'lgtimprimerie@gmail.com';

const STATUS_LABELS = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PROCESSING: 'En cours de traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée'
};

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Public (guest) or Private
exports.createOrder = async (req, res) => {
  try {
    const { designs, totalPrice, type, productId, quantities, guestEmail } = req.body;
    const userId = req.user?.userId || null;

    console.log('📦 Création commande pour userId:', userId || 'guest');
    console.log('📦 Type:', type || 'custom');
    console.log('📦 Designs reçus:', JSON.stringify(designs, null, 2));
    console.log('📦 Prix total:', totalPrice);

    if (!userId && !guestEmail) {
      return res.status(400).json({ error: 'Email requis pour commander sans compte' });
    }

    // Vérifier minimum articles pour comptes pro
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { accountType: true } }) : null;
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
        guestEmail: userId ? null : guestEmail,
        totalPrice: totalPrice,
        status: 'PENDING',
        shippingAddress: 'A définir',
        shippingCity: 'A définir',
        shippingZip: '00000',
        shippingCountry: 'France'
      }
    });

    if (type === 'guest-design' && productId) {
      // Commande guest avec design personnalisé (pas de compte)
      const { frontDesignJson, backDesignJson, frontPreviewUrl, backPreviewUrl, tshirtColor: tc } = req.body;
      const design = await prisma.design.create({
        data: {
          userId: null,
          productId: parseInt(productId),
          frontDesignJson: frontDesignJson || '{"objects":[]}',
          backDesignJson: backDesignJson || null,
          frontPreviewUrl: frontPreviewUrl || null,
          backPreviewUrl: backPreviewUrl || null,
          tshirtColor: tc || null,
          name: 'Design personnalisé',
          quantities: quantities,
          totalPrice: totalPrice,
          finalPrice: totalPrice
        }
      });
      await prisma.orderDesign.create({
        data: { orderId: order.id, designId: design.id, quantities: quantities || {}, finalPrice: totalPrice }
      });
    } else if (type === 'ready-made' && productId) {
      // Commande de produit fini (sans design personnalisé)
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

    // Email alerte admin
    try {
      const clientUser = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true, lastName: true } }) : null;
      const clientLabel = clientUser ? `${clientUser.firstName || ''} ${clientUser.lastName || ''} (${clientUser.email})` : `Guest (${guestEmail})`;
      const totalArticles = completeOrder.orderDesigns.reduce((sum, od) => {
        return sum + Object.values(od.quantities || {}).reduce((s, q) => s + q, 0);
      }, 0);
      await getResend().emails.send({
        from: 'LGT Imprimerie <noreply@lgt-imprimerie.com>',
        to: ADMIN_EMAIL,
        subject: `🛒 Nouvelle commande #${order.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1931; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #0EA5E9; margin-bottom: 4px;">LGT<span style="color: #0EA5E9;">.</span></h1>
            <h2 style="color: #fff; margin-bottom: 24px;">Nouvelle commande reçue</h2>
            <div style="background: #0D2137; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #94a3b8; margin: 0 0 8px;"><strong style="color:#fff;">Commande #:</strong> ${order.id}</p>
              <p style="color: #94a3b8; margin: 0 0 8px;"><strong style="color:#fff;">Client :</strong> ${clientLabel}</p>
              <p style="color: #94a3b8; margin: 0 0 8px;"><strong style="color:#fff;">Articles :</strong> ${totalArticles}</p>
              <p style="color: #94a3b8; margin: 0;"><strong style="color:#fff;">Total :</strong> ${totalPrice} €</p>
            </div>
            <a href="https://lgt-imprimerie.com/admin/orders" style="display: inline-block; background: #0EA5E9; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Voir la commande
            </a>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('⚠️ Erreur email admin:', emailErr.message);
    }

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
// @access  Private or Guest (via guestEmail query param)
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user?.userId || null;
    const guestEmail = req.query.guestEmail;

    // Build where clause: user must own the order
    let whereClause = { id: orderId };
    if (userId) {
      whereClause.userId = userId;
    } else if (guestEmail) {
      whereClause.guestEmail = guestEmail;
    } else {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
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
        user: { select: { email: true, firstName: true } },
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

    // Email au client pour le changement de statut
    try {
      const clientEmail = order.user?.email || order.guestEmail;
      if (clientEmail) {
      const statusLabel = STATUS_LABELS[upperStatus] || upperStatus;
      const statusColor = upperStatus === 'SHIPPED' ? '#22c55e' : upperStatus === 'DELIVERED' ? '#0EA5E9' : upperStatus === 'CANCELLED' ? '#ef4444' : '#f59e0b';
      await getResend().emails.send({
        from: 'LGT Imprimerie <noreply@lgt-imprimerie.com>',
        to: clientEmail,
        subject: `Commande #${orderId} — ${statusLabel}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1931; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #0EA5E9; margin-bottom: 4px;">LGT<span style="color: #0EA5E9;">.</span></h1>
            <h2 style="color: #fff; margin-bottom: 24px;">Mise à jour de votre commande</h2>
            <p style="color: #94a3b8; margin-bottom: 20px;">Bonjour ${order.user?.firstName || ''},</p>
            <div style="background: #0D2137; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #94a3b8; margin: 0 0 8px;"><strong style="color:#fff;">Commande #:</strong> ${orderId}</p>
              <p style="color: #94a3b8; margin: 0;"><strong style="color:#fff;">Nouveau statut :</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span></p>
            </div>
            ${upperStatus === 'SHIPPED' ? `<p style="color: #94a3b8; margin-bottom: 20px;">Votre commande est en route ! Vous la recevrez très prochainement.</p>` : ''}
            ${upperStatus === 'DELIVERED' ? `<p style="color: #94a3b8; margin-bottom: 20px;">Votre commande a été livrée. Merci pour votre confiance !</p>` : ''}
            <a href="https://lgt-imprimerie.com/my-orders" style="display: inline-block; background: #0EA5E9; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Voir mes commandes
            </a>
          </div>
        `,
      });
      }
    } catch (emailErr) {
      console.error('⚠️ Erreur email statut client:', emailErr.message);
    }

    res.json({
      message: 'Statut de la commande mis à jour',
      order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// @desc    Suivre une commande publiquement (sans connexion)
// @route   POST /api/orders/track
// @access  Public
exports.trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      return res.status(400).json({ error: 'Numéro de commande et email requis' });
    }

    const orderIdInt = parseInt(orderId);
    if (isNaN(orderIdInt)) {
      return res.status(400).json({ error: 'Numéro de commande invalide' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderIdInt },
      include: {
        user: { select: { email: true } },
        orderDesigns: {
          include: {
            design: {
              include: {
                product: { select: { id: true, name: true, mockupFrontUrl: true } }
              }
            }
          }
        }
      }
    });

    // Vérifier que l'email correspond (compte ou guest)
    const orderEmail = order?.user?.email || order?.guestEmail;
    if (!order || !orderEmail || orderEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    res.json({
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalPrice: order.totalPrice,
        items: order.orderDesigns.map(od => ({
          productName: od.design.product?.name || 'Produit personnalisé',
          productImage: od.design.product?.mockupFrontUrl || od.design.frontPreviewUrl || null,
          quantities: od.quantities,
          finalPrice: od.finalPrice
        }))
      }
    });
  } catch (error) {
    console.error('Erreur trackOrder:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
