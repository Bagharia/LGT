const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Creer une session de paiement Stripe Checkout
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId, shippingInfo } = req.body;
    const userId = req.user.userId;

    console.log('=== CREATE CHECKOUT SESSION ===');
    console.log('orderId:', orderId, 'type:', typeof orderId);
    console.log('userId:', userId);
    console.log('shippingInfo:', JSON.stringify(shippingInfo));

    // Recuperer la commande avec les designs
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId
      },
      include: {
        orderDesigns: {
          include: {
            design: true
          }
        }
      }
    });

    console.log('Order found:', order ? 'YES' : 'NO');
    console.log('OrderDesigns count:', order?.orderDesigns?.length);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvee' });
    }

    // Mettre a jour les infos de livraison
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingZip: shippingInfo.zipCode,
        shippingCountry: shippingInfo.country
      }
    });

    // Creer les line items pour Stripe
    const lineItems = order.orderDesigns.map((od) => {
      const totalQty = Object.values(od.quantities || {}).reduce((sum, qty) => sum + qty, 0);
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: od.design?.name || 'Design #' + od.designId,
            description: 'T-shirt personnalise - ' + totalQty + ' article(s)',
          },
          unit_amount: Math.round(od.finalPrice * 100),
        },
        quantity: 1,
      };
    });

    console.log('Line items pour Stripe:', JSON.stringify(lineItems, null, 2));

    // Creer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: process.env.FRONTEND_URL + '/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=' + order.id,
      cancel_url: process.env.FRONTEND_URL + '/checkout?orderId=' + order.id,
      customer_email: shippingInfo.email,
      metadata: {
        orderId: order.id.toString(),
        userId: userId.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur creation session Stripe:', error.message);
    console.error('Stripe error details:', error.raw || error);
    res.status(500).json({ error: 'Erreur lors de la creation du paiement', details: error.message });
  }
};

// Webhook pour recevoir les evenements Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!endpointSecret) {
      console.error('⚠️ STRIPE_WEBHOOK_SECRET non défini — webhook rejeté');
      return res.status(400).send('Webhook Error: missing endpoint secret');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur webhook signature:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = parseInt(session.metadata.orderId);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripeSessionId: session.id
      }
    });

    console.log('Commande ' + orderId + ' payee avec succes');
  }

  res.json({ received: true });
};

// Verifier le statut d'un paiement
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.query;
    const userId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvee' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      if (order.status === 'PENDING') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            stripeSessionId: sessionId
          }
        });
      }

      return res.json({
        success: true,
        message: 'Paiement confirme',
        order: { ...order, status: 'PAID' }
      });
    }

    res.json({ success: false, message: 'Paiement non complete' });
  } catch (error) {
    console.error('Erreur verification paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la verification' });
  }
};
