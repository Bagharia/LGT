import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ordersAPI, stripeAPI } from '../services/api';
import Header from '../components/Header';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France'
  });

  useEffect(() => {
    if (orderId) {
      // Mode: commande existante (design personnalisé)
      loadOrder();
    } else {
      // Mode: produit fini depuis localStorage
      const stored = localStorage.getItem('pendingOrder');
      if (stored) {
        setPendingOrder(JSON.parse(stored));
        setLoading(false);
      } else {
        navigate('/products');
      }
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await ordersAPI.getById(orderId);
      setOrder(data.order);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Commande non trouvée');
      navigate('/my-orders');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.address || !formData.city || !formData.zipCode) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);

      let finalOrderId = orderId;

      // Si c'est un produit fini (pas d'orderId), créer d'abord la commande
      if (!orderId && pendingOrder) {
        setCreatingOrder(true);

        // Créer la commande pour produit fini
        const orderData = {
          type: 'ready-made',
          productId: pendingOrder.productId,
          quantities: pendingOrder.quantities,
          totalPrice: pendingOrder.totalPrice,
        };

        const result = await ordersAPI.create(orderData);
        finalOrderId = result.order.id;

        // Nettoyer le localStorage
        localStorage.removeItem('pendingOrder');
        setCreatingOrder(false);
      }

      // Créer la session de paiement Stripe
      const { url } = await stripeAPI.createCheckoutSession(finalOrderId, formData);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erreur:', error);
      const details = error.response?.data?.details || error.message || '';
      alert('Erreur lors de la création du paiement: ' + details);
      setSubmitting(false);
      setCreatingOrder(false);
    }
  };

  // Calculer le total à afficher
  const displayTotal = order?.totalPrice || pendingOrder?.totalPrice || 0;
  const displayItems = order?.designs || (pendingOrder ? [{
    id: 'pending',
    name: pendingOrder.productName,
    frontPreviewUrl: pendingOrder.productImage,
    quantities: pendingOrder.quantities,
    finalPrice: pendingOrder.totalPrice,
  }] : []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 pt-28 pb-12">
        {/* Title */}
        <div className="mb-12">
          <Link to="/products" className="text-accent hover:text-white transition-colors text-sm mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continuer mes achats
          </Link>
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Finaliser la <span className="accent">commande</span>
          </h1>
          <p className="text-text-muted text-lg">
            {orderId ? `Commande #${orderId} - ` : ''}Plus qu'une étape avant de recevoir {pendingOrder ? 'votre t-shirt' : 'vos créations'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="bg-[#111] rounded-2xl border border-white/10 p-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-8">
                Informations de livraison
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Prénom <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Nom <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Email <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Adresse <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Code postal <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Ville <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Pays <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      {creatingOrder ? 'Création de la commande...' : 'Redirection vers le paiement...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payer {displayTotal.toFixed(2)} € avec Stripe
                    </>
                  )}
                </button>

                <p className="text-xs text-text-muted text-center">
                  Paiement sécurisé par Stripe. Vos informations bancaires ne sont jamais stockées sur notre serveur.
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] rounded-2xl border border-white/10 p-8 sticky top-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-8">
                Récapitulatif
              </h2>

              {/* Order Items */}
              <div className="space-y-6 mb-8">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-white/10">
                    {item.frontPreviewUrl && (
                      <img
                        src={item.frontPreviewUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl border border-white/10"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.quantities && Object.entries(item.quantities).map(([size, qty]) => (
                          qty > 0 && (
                            <span key={size} className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                              {size}: {qty}
                            </span>
                          )
                        ))}
                      </div>
                      <p className="text-accent font-semibold">
                        {item.finalPrice?.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex justify-between text-text-muted">
                  <span>Sous-total</span>
                  <span>{displayTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Livraison</span>
                  <span className="text-accent">Gratuite</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-4 mt-4">
                  <span>Total</span>
                  <span className="text-accent">{displayTotal.toFixed(2)} €</span>
                </div>
              </div>

              {/* Info Badges */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-accent font-medium">Livraison gratuite</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-cyan-400 font-medium">Paiement 100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
