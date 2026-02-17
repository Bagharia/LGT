import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Header from '../../components/Header';

// Constantes de conversion (identiques à l'éditeur)
const PX_PER_CM = 240 / 30; // 8 px/cm
const PRINT_AREA = { left: 130, top: 80, width: 240, height: 320 };

const parseDesignElements = (designJson) => {
  if (!designJson) return [];
  try {
    const data = JSON.parse(designJson);
    const objects = data.objects || [];
    return objects.map(obj => {
      const scaledWidth = (obj.width || 0) * (obj.scaleX || 1);
      const scaledHeight = (obj.height || 0) * (obj.scaleY || 1);
      return {
        type: obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text' ? 'text' : 'image',
        text: obj.text || null,
        fontFamily: obj.fontFamily || null,
        fontSize: obj.fontSize || null,
        fill: obj.fill || null,
        fontWeight: obj.fontWeight || null,
        fontStyle: obj.fontStyle || null,
        posX: ((obj.left || 0) - PRINT_AREA.left) / PX_PER_CM,
        posY: ((obj.top || 0) - PRINT_AREA.top) / PX_PER_CM,
        widthCm: scaledWidth / PX_PER_CM,
        heightCm: scaledHeight / PX_PER_CM,
        angle: obj.angle || 0,
      };
    });
  } catch {
    return [];
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAllAdmin();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
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

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter || order.status === filter.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="px-8 md:px-16 py-12 pt-24">
        {/* Page Title */}
        <div className="mb-8">
          <Link to="/admin" className="text-accent hover:text-white transition-colors text-sm mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Dashboard
          </Link>
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Gestion des <span className="accent">Commandes</span>
          </h1>
          <p className="text-text-muted text-lg">
            {filteredOrders.length} commande(s) {filter !== 'all' ? `(${getStatusConfig(filter).label})` : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          {[
            { key: 'all', label: 'Toutes', count: orders.length },
            { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending' || o.status === 'PENDING').length },
            { key: 'PAID', label: 'Payées', count: orders.filter(o => o.status === 'paid' || o.status === 'PAID').length },
            { key: 'processing', label: 'En production', count: orders.filter(o => o.status === 'processing' || o.status === 'PROCESSING').length },
            { key: 'shipped', label: 'Expédiées', count: orders.filter(o => o.status === 'shipped' || o.status === 'SHIPPED').length },
            { key: 'delivered', label: 'Livrées', count: orders.filter(o => o.status === 'delivered' || o.status === 'DELIVERED').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === key
                  ? 'bg-accent text-primary'
                  : 'bg-white/5 text-text-muted border border-white/10 hover:border-accent/50 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-space-grotesk text-xl font-bold text-white mb-2">Aucune commande</h3>
              <p className="text-text-muted">Il n'y a pas de commandes pour ce filtre.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Designs</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">
                            {order.user?.firstName && order.user?.lastName
                              ? `${order.user.firstName} ${order.user.lastName}`
                              : 'N/A'}
                          </p>
                          <p className="text-text-muted text-sm">{order.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-text-muted">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-text-muted">{order.designs?.length || 0} design(s)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-accent font-semibold">{order.totalPrice?.toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-accent hover:text-white transition-colors font-medium"
                          >
                            Détails
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-accent"
                          >
                            <option value="PENDING" className="bg-[#0D2137]">En attente</option>
                            <option value="PAID" className="bg-[#0D2137]">Payée</option>
                            <option value="PROCESSING" className="bg-[#0D2137]">En production</option>
                            <option value="SHIPPED" className="bg-[#0D2137]">Expédiée</option>
                            <option value="DELIVERED" className="bg-[#0D2137]">Livrée</option>
                            <option value="CANCELLED" className="bg-[#0D2137]">Annulée</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
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
                  {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
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
              {(selectedOrder.shippingAddress || selectedOrder.shippingCity) && (
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
              )}

              {/* Articles */}
              {selectedOrder.designs && selectedOrder.designs.length > 0 && (
                <div>
                  <h3 className="font-space-grotesk text-lg font-semibold text-white mb-3">
                    Articles ({selectedOrder.designs.length})
                  </h3>
                  <div className="space-y-6">
                    {selectedOrder.designs.map((design, index) => {
                      const frontElements = parseDesignElements(design.frontDesignJson);
                      const backElements = parseDesignElements(design.backDesignJson);

                      return (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-5"
                        >
                          {/* Header du design */}
                          <div className="flex gap-4 mb-4">
                            <div className="flex gap-2">
                              {design.frontPreviewUrl && (
                                <img
                                  src={design.frontPreviewUrl}
                                  alt={`${design.name} - avant`}
                                  className="w-24 h-28 object-cover rounded-lg border border-white/10"
                                />
                              )}
                              {design.backPreviewUrl && (
                                <img
                                  src={design.backPreviewUrl}
                                  alt={`${design.name} - arrière`}
                                  className="w-24 h-28 object-cover rounded-lg border border-white/10"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{design.name}</h4>
                              {design.tshirtColor && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-text-muted text-sm">Couleur:</span>
                                  <span
                                    className="w-5 h-5 rounded-full border border-white/20 inline-block"
                                    style={{ backgroundColor: design.tshirtColor }}
                                  />
                                  <span className="text-white text-sm">{design.tshirtColor}</span>
                                </div>
                              )}
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

                          {/* Détails de placement - Face avant */}
                          {frontElements.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <h5 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                                Face Avant — Placement ({frontElements.length} élément{frontElements.length > 1 ? 's' : ''})
                              </h5>
                              <div className="space-y-2">
                                {frontElements.map((el, i) => (
                                  <div key={i} className="bg-black/30 rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                        el.type === 'text' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                      }`}>
                                        {el.type === 'text' ? 'TEXTE' : 'IMAGE'}
                                      </span>
                                      {el.type === 'text' && el.text && (
                                        <span className="text-white text-sm font-medium truncate">"{el.text}"</span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Position X</span>
                                        <span className="text-white font-mono">{el.posX.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Position Y</span>
                                        <span className="text-white font-mono">{el.posY.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Largeur</span>
                                        <span className="text-white font-mono">{el.widthCm.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Hauteur</span>
                                        <span className="text-white font-mono">{el.heightCm.toFixed(1)} cm</span>
                                      </div>
                                    </div>
                                    {el.type === 'text' && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-2">
                                        {el.fontFamily && (
                                          <div className="bg-white/5 rounded px-2 py-1.5">
                                            <span className="text-text-muted block">Police</span>
                                            <span className="text-white">{el.fontFamily}</span>
                                          </div>
                                        )}
                                        {el.fontSize && (
                                          <div className="bg-white/5 rounded px-2 py-1.5">
                                            <span className="text-text-muted block">Taille police</span>
                                            <span className="text-white font-mono">{el.fontSize}px</span>
                                          </div>
                                        )}
                                        {el.fill && (
                                          <div className="bg-white/5 rounded px-2 py-1.5 flex items-center gap-2">
                                            <span className="text-text-muted">Couleur</span>
                                            <span
                                              className="w-4 h-4 rounded border border-white/20 inline-block"
                                              style={{ backgroundColor: el.fill }}
                                            />
                                            <span className="text-white text-xs">{el.fill}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {el.angle !== 0 && (
                                      <div className="mt-2 text-xs bg-white/5 rounded px-2 py-1.5 inline-block">
                                        <span className="text-text-muted">Rotation: </span>
                                        <span className="text-white font-mono">{el.angle.toFixed(1)}°</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Détails de placement - Face arrière */}
                          {backElements.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <h5 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                                Face Arrière — Placement ({backElements.length} élément{backElements.length > 1 ? 's' : ''})
                              </h5>
                              <div className="space-y-2">
                                {backElements.map((el, i) => (
                                  <div key={i} className="bg-black/30 rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                        el.type === 'text' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                      }`}>
                                        {el.type === 'text' ? 'TEXTE' : 'IMAGE'}
                                      </span>
                                      {el.type === 'text' && el.text && (
                                        <span className="text-white text-sm font-medium truncate">"{el.text}"</span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Position X</span>
                                        <span className="text-white font-mono">{el.posX.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Position Y</span>
                                        <span className="text-white font-mono">{el.posY.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Largeur</span>
                                        <span className="text-white font-mono">{el.widthCm.toFixed(1)} cm</span>
                                      </div>
                                      <div className="bg-white/5 rounded px-2 py-1.5">
                                        <span className="text-text-muted block">Hauteur</span>
                                        <span className="text-white font-mono">{el.heightCm.toFixed(1)} cm</span>
                                      </div>
                                    </div>
                                    {el.type === 'text' && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-2">
                                        {el.fontFamily && (
                                          <div className="bg-white/5 rounded px-2 py-1.5">
                                            <span className="text-text-muted block">Police</span>
                                            <span className="text-white">{el.fontFamily}</span>
                                          </div>
                                        )}
                                        {el.fontSize && (
                                          <div className="bg-white/5 rounded px-2 py-1.5">
                                            <span className="text-text-muted block">Taille police</span>
                                            <span className="text-white font-mono">{el.fontSize}px</span>
                                          </div>
                                        )}
                                        {el.fill && (
                                          <div className="bg-white/5 rounded px-2 py-1.5 flex items-center gap-2">
                                            <span className="text-text-muted">Couleur</span>
                                            <span
                                              className="w-4 h-4 rounded border border-white/20 inline-block"
                                              style={{ backgroundColor: el.fill }}
                                            />
                                            <span className="text-white text-xs">{el.fill}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {el.angle !== 0 && (
                                      <div className="mt-2 text-xs bg-white/5 rounded px-2 py-1.5 inline-block">
                                        <span className="text-text-muted">Rotation: </span>
                                        <span className="text-white font-mono">{el.angle.toFixed(1)}°</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Message si aucun élément */}
                          {frontElements.length === 0 && backElements.length === 0 && (
                            <div className="mt-3 text-text-muted text-sm italic border-t border-white/10 pt-3">
                              Aucune donnée de placement disponible pour ce design.
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default AdminOrders;
