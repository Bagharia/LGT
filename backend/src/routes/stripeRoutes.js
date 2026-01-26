const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Creer une session de paiement (authentifie)
router.post('/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);

// Verifier un paiement (authentifie)
router.get('/verify-payment', authMiddleware, stripeController.verifyPayment);

// Webhook Stripe (pas d'auth, Stripe envoie directement)
router.post('/webhook', stripeController.handleWebhook);

module.exports = router;
