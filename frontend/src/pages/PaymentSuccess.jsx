import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { stripeAPI } from '../services/api';
import Header from '../components/Header';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId && orderId) {
      verifyPayment();
    } else {
      setError('Paramètres manquants');
      setLoading(false);
    }
  }, [sessionId, orderId]);

  const verifyPayment = async () => {
    try {
      const result = await stripeAPI.verifyPayment(sessionId, orderId);
      if (!result.success) {
        setError('Le paiement n\'a pas pu être vérifié');
      }
    } catch (err) {
      console.error('Erreur verification:', err);
      setError('Erreur lors de la vérification du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
          <div className="bg-[#0D2137] rounded-2xl border border-red-500/50 p-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-space-grotesk text-3xl font-bold text-white mb-4">Erreur de paiement</h1>
            <p className="text-text-muted mb-8">{error}</p>
            <Link
              to="/my-orders"
              className="inline-block px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:bg-accent-dark transition-colors"
            >
              Voir mes commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        <div className="bg-[#0D2137] rounded-2xl border border-accent/30 p-8 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-space-grotesk text-4xl font-bold text-white mb-4">
            Paiement <span className="text-accent">réussi</span> !
          </h1>

          <p className="text-text-muted text-lg mb-2">
            Merci pour votre commande !
          </p>
          <p className="text-text-muted mb-10">
            Votre commande <span className="font-semibold text-white">#{orderId}</span> a été confirmée.
          </p>

          {/* Steps */}
          <div className="bg-white/5 rounded-xl p-6 mb-10 text-left">
            <h3 className="font-semibold text-white mb-4 text-center">Prochaines étapes</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-muted">Vous recevrez un email de confirmation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-muted">Votre commande sera traitée sous 24-48h</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-muted">Suivez votre commande dans "Mes Commandes"</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/my-orders"
              className="px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all"
            >
              Voir mes commandes
            </Link>
            <Link
              to="/products"
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold hover:border-accent hover:text-accent transition-all"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
