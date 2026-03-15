const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { optionalAuthMiddleware } = require('../middlewares/authMiddleware');

// Creer une session de paiement (guest ou connecté)
router.post('/create-checkout-session', optionalAuthMiddleware, stripeController.createCheckoutSession);

// Verifier un paiement (guest ou connecté)
router.get('/verify-payment', optionalAuthMiddleware, stripeController.verifyPayment);

// Webhook Stripe (pas d'auth, Stripe envoie directement)
router.post('/webhook', stripeController.handleWebhook);

module.exports = router;
