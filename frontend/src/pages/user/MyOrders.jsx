import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Header from '../../components/Header';
import useSEO from '../../hooks/useSEO';

const MyOrders = () => {
  useSEO({ title: 'Mes commandes', path: '/my-orders' });
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getMy();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'En attente' },
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'En attente' },
      processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'En production' },
      PROCESSING: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'En production' },
      shipped: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Expédiée' },
      SHIPPED: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Expédiée' },
      delivered: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livrée' },
      DELIVERED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livrée' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Annulée' },
      CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Annulée' },
      PAID: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30', label: 'Payée' },
    };
    return config[status] || { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20', label: status };
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-8 md:px-16">
        <div>
          <div className="hero-tag mb-6">
            Suivi de commandes
          </div>
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Mes <span className="accent">Commandes</span>
          </h1>
          <p className="text-xl text-text-muted max-w-xl">
            Suivez l'état de vos commandes et retrouvez votre historique d'achats.
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="px-8 md:px-16 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-space-grotesk text-3xl font-bold text-white mb-4">
              Aucune commande
            </h3>
            <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
              Vous n'avez pas encore passé de commande. Découvrez notre collection et créez votre premier design.
            </p>
            <Link to="/products" className="btn-primary">
              Découvrir la collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden hover:border-accent/30 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-space-grotesk text-xl font-bold text-white">
                          Commande #{order.id}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-text-muted text-sm">
                        Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-space-grotesk text-3xl font-bold text-accent">
                        {order.totalPrice?.toFixed(2)} EUR
                      </p>
                    </div>
                  </div>

                  {/* Designs Preview */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.designs?.map((design) => (
                        <div key={design.id} className="flex-shrink-0">
                          {design.frontPreviewUrl && (
                            <img
                              src={design.frontPreviewUrl}
                              alt={design.name}
                              className="w-20 h-20 object-cover rounded-xl border border-white/10"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-text-muted text-sm mt-3">
                      {order.designs?.length || 0} design(s) dans cette commande
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
                    >
                      Voir les détails
                    </button>
                    {(order.status === 'PENDING' || order.status === 'pending') && (
                      <button
                        onClick={() => navigate(`/checkout?orderId=${order.id}`)}
                        className="btn-primary"
                      >
                        Payer maintenant
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#0D2137] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div>
                <h2 className="font-space-grotesk text-2xl font-bold text-white mb-2">
                  Commande #{selectedOrder.id}
                </h2>
                <p className="text-text-muted">
                  Passée le {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Status */}
              <div>
                <h3 className="font-space-grotesk text-lg font-semibold text-white mb-3">Statut</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Designs */}
              <div>
                <h3 className="font-space-grotesk text-lg font-semibold text-white mb-4">Vos designs</h3>
                <div className="space-y-4">
                  {selectedOrder.designs?.map((design) => (
                    <div
                      key={design.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4"
                    >
                      {design.frontPreviewUrl && (
                        <img
                          src={design.frontPreviewUrl}
                          alt={design.name}
                          className="w-24 h-24 object-cover rounded-lg border border-white/10"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{design.name}</h4>
                        <p className="text-text-muted text-sm mb-2">Quantités:</p>
                        <div className="flex flex-wrap gap-2">
                          {design.quantities && Object.entries(design.quantities).map(([size, qty]) => (
                            qty > 0 && (
                              <span
                                key={size}
                                className="text-sm bg-white/10 text-white px-3 py-1 rounded-lg"
                              >
                                {size}: {qty}
                              </span>
                            )
                          ))}
                        </div>
                        <p className="mt-3 font-semibold text-accent">
                          {design.finalPrice?.toFixed(2)} EUR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl text-white">Total</span>
                  <span className="font-space-grotesk text-4xl font-bold text-accent">
                    {selectedOrder.totalPrice?.toFixed(2)} EUR
                  </span>
                </div>
                <p className="text-text-muted text-sm mt-2">TTC, frais de port inclus</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default MyOrders;
