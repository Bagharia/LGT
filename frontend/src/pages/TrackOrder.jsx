import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Header from '../components/Header';
import useSEO from '../hooks/useSEO';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Commande reçue' },
  { key: 'PAID', label: 'Paiement confirmé' },
  { key: 'PROCESSING', label: 'En production' },
  { key: 'SHIPPED', label: 'Expédiée' },
  { key: 'DELIVERED', label: 'Livrée' },
];

const STATUS_INDEX = {
  PENDING: 0,
  pending: 0,
  PAID: 1,
  paid: 1,
  PROCESSING: 2,
  processing: 2,
  SHIPPED: 3,
  shipped: 3,
  DELIVERED: 4,
  delivered: 4,
};

const getStatusConfig = (status) => {
  const config = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'En attente' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'En attente' },
    PAID: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30', label: 'Payée' },
    paid: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30', label: 'Payée' },
    PROCESSING: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'En production' },
    processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'En production' },
    SHIPPED: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Expédiée' },
    shipped: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Expédiée' },
    DELIVERED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livrée' },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livrée' },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Annulée' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Annulée' },
  };
  return config[status] || { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20', label: status };
};

const TrackOrder = () => {
  useSEO({ title: 'Suivi de commande', path: '/track-order' });

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    const parsedId = parseInt(orderId);
    if (!orderId || isNaN(parsedId) || parsedId <= 0) {
      setError('Veuillez entrer un numéro de commande valide.');
      return;
    }
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);
    try {
      const data = await ordersAPI.track(parsedId, email.trim());
      setOrder(data.order);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Aucune commande trouvée avec ces informations. Vérifiez votre numéro de commande et votre email.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order && (order.status === 'CANCELLED' || order.status === 'cancelled');
  const currentStep = order ? (STATUS_INDEX[order.status] ?? -1) : -1;

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Hero */}
      <div className="pt-24 pb-8 px-8 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-sm font-medium rounded-full mb-4">
            Suivi commande
          </span>
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Où est ma commande ?
          </h1>
          <p className="text-text-muted text-lg">
            Entrez votre numéro de commande et votre email pour suivre l'état de votre livraison.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="px-8 md:px-16 pb-16">
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-[#0D2137] rounded-2xl p-8 mb-8">
            <div className="mb-5">
              <label className="block text-white font-medium mb-2">Numéro de commande</label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Ex: 42"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="l'email utilisé lors de la commande"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
            </div>
            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher
                </>
              )}
            </button>
          </form>

          {/* Résultat */}
          {order && (
            <div className="space-y-6">
              {/* Header commande */}
              <div className="bg-[#0D2137] rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-text-muted text-sm mb-1">Commande #{order.id}</p>
                    <p className="text-white font-medium">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-accent font-bold text-xl">{parseFloat(order.totalPrice).toFixed(2)} €</span>
                    {(() => {
                      const cfg = getStatusConfig(order.status);
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Stepper */}
              {!isCancelled && (
                <div className="bg-[#0D2137] rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-6">Progression</h3>
                  <div className="relative">
                    {/* Barre de progression */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between relative z-10">
                      {STATUS_STEPS.map((step, index) => {
                        const done = index <= currentStep;
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-accent border-accent' : 'bg-primary border-white/20'}`}>
                              {done ? (
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-white/20" />
                              )}
                            </div>
                            <span className={`text-xs text-center leading-tight ${done ? 'text-accent font-medium' : 'text-text-muted'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Articles */}
              {order.items && order.items.length > 0 && (
                <div className="bg-[#0D2137] rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">Articles commandés</h3>
                  <div className="space-y-4">
                    {order.items.map((item, i) => {
                      const quantities = Object.entries(item.quantities || {}).filter(([, qty]) => qty > 0);
                      return (
                        <div key={i} className="flex gap-4 items-start">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{item.productName}</p>
                            {quantities.length > 0 && (
                              <p className="text-text-muted text-sm mt-1">
                                {quantities.map(([k, v]) => `${k}: ${v}`).join(' · ')}
                              </p>
                            )}
                          </div>
                          <p className="text-accent font-semibold flex-shrink-0">
                            {parseFloat(item.finalPrice).toFixed(2)} €
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aide */}
          <div className="mt-10 text-center text-text-muted text-sm">
            Un problème avec votre commande ?{' '}
            <Link to="/" className="text-accent hover:underline">Contactez-nous</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 md:px-16 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-space-grotesk text-xl font-bold text-white">
            LGT<span className="text-accent">.</span>
          </Link>
          <p className="text-text-muted text-sm">
            &copy; 2026 LGT. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TrackOrder;
