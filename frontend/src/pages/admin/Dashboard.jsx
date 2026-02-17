import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Header from '../../components/Header';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await ordersAPI.getAllAdmin();
      const orders = data.orders || [];

      const totalRevenue = orders
        .filter(order => order.status === 'PAID' || order.status === 'paid')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'PENDING' || order.status === 'pending').length;
      const paidOrders = orders.filter(order => order.status === 'PAID' || order.status === 'paid').length;
      const recentOrders = orders.slice(0, 5);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        paidOrders,
        totalRevenue,
        recentOrders
      });
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
      paid: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30', label: 'Payée' },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="px-8 md:px-16 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <div className="hero-tag mb-4">
            Administration
          </div>
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Dashboard <span className="accent">Admin</span>
          </h1>
          <p className="text-text-muted text-lg">
            Vue d'ensemble de votre boutique LGT
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Commandes */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs text-text-muted bg-white/5 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-white mb-1">{stats.totalOrders}</p>
            <p className="text-text-muted text-sm">Commandes totales</p>
          </div>

          {/* En Attente */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">À traiter</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-yellow-400 mb-1">{stats.pendingOrders}</p>
            <p className="text-text-muted text-sm">En attente de paiement</p>
          </div>

          {/* Payées */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">Confirmées</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-accent mb-1">{stats.paidOrders}</p>
            <p className="text-text-muted text-sm">Commandes payées</p>
          </div>

          {/* Revenu */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Revenu</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-green-400 mb-1">{stats.totalRevenue.toFixed(2)} €</p>
            <p className="text-text-muted text-sm">Revenu total</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            to="/admin/orders"
            className="group bg-[#0D2137] rounded-2xl border border-white/10 p-8 hover:border-accent/50 transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-space-grotesk text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  Gérer les Commandes
                </h3>
                <p className="text-text-muted">Voir et modifier le statut des commandes</p>
              </div>
              <svg className="w-6 h-6 text-text-muted ml-auto group-hover:text-accent group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="group bg-[#0D2137] rounded-2xl border border-white/10 p-8 hover:border-accent/50 transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-space-grotesk text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  Gérer les Produits
                </h3>
                <p className="text-text-muted">Ajouter et modifier les produits</p>
              </div>
              <svg className="w-6 h-6 text-text-muted ml-auto group-hover:text-accent group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="font-space-grotesk text-2xl font-bold text-white">Commandes Récentes</h2>
              <p className="text-text-muted text-sm mt-1">Les 5 dernières commandes</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-accent hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              Voir tout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-text-muted">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">
                          {order.user?.firstName && order.user?.lastName
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-text-muted">{order.user?.email || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-text-muted">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-accent font-semibold">{order.totalPrice?.toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-accent hover:text-white transition-colors font-medium"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Détails Commande */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#0D2137] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
            <div className="p-6 space-y-6">
              {/* Status & Total */}
              <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">Statut:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <span className="text-text-muted text-sm">Total</span>
                  <p className="font-space-grotesk text-3xl font-bold text-accent">
                    {selectedOrder.totalPrice?.toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="font-space-grotesk text-lg font-semibold text-white mb-3">
                  Informations Client
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <p className="text-white">
                    <span className="text-text-muted">Nom:</span> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                  <p className="text-white">
                    <span className="text-text-muted">Email:</span> {selectedOrder.user?.email}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-space-grotesk text-lg font-semibold text-white mb-3">
                  Adresse de Livraison
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <p className="text-white">
                    <span className="text-text-muted">Adresse:</span> {selectedOrder.shippingAddress || 'Non renseignée'}
                  </p>
                  <p className="text-white">
                    <span className="text-text-muted">Ville:</span> {selectedOrder.shippingCity || 'Non renseignée'}
                  </p>
                  <p className="text-white">
                    <span className="text-text-muted">Code postal:</span> {selectedOrder.shippingZip || 'Non renseigné'}
                  </p>
                  <p className="text-white">
                    <span className="text-text-muted">Pays:</span> {selectedOrder.shippingCountry || 'Non renseigné'}
                  </p>
                </div>
              </div>

              {/* Articles */}
              {selectedOrder.designs && selectedOrder.designs.length > 0 && (
                <div>
                  <h3 className="font-space-grotesk text-lg font-semibold text-white mb-3">
                    Articles ({selectedOrder.designs.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.designs.map((design, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4"
                      >
                        {design.frontPreviewUrl && (
                          <img
                            src={design.frontPreviewUrl}
                            alt={design.name}
                            className="w-20 h-20 object-cover rounded-lg border border-white/10"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{design.name}</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {design.quantities && Object.entries(design.quantities).map(([size, qty]) => (
                              qty > 0 && (
                                <span
                                  key={size}
                                  className="text-xs bg-white/10 text-white px-2 py-1 rounded"
                                >
                                  {size}: {qty}
                                </span>
                              )
                            ))}
                          </div>
                          <p className="text-accent font-semibold">{design.finalPrice?.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full btn-primary justify-center"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 md:px-16 py-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-space-grotesk text-xl font-bold text-white">
            LGT<span className="text-accent">.</span>
          </Link>
          <p className="text-text-muted text-sm">
            &copy; 2026 LGT. Panel Administrateur.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
