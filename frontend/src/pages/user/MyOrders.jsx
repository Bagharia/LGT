import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const MyOrders = () => {
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      processing: 'En production',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') {
      return (
        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-gray-600 mt-2">Suivez l'état de vos commandes</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-gray-100 rounded-xl border-2 border-gray-300 p-12 text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h3>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md border-2 border-black overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">Commande #{order.id}</h3>
                      {getStatusIcon(order.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {order.totalPrice?.toFixed(2)} €
                    </p>
                  </div>
                </div>

                {/* Designs Preview */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.designs?.map((design) => (
                      <div key={design.id} className="flex-shrink-0">
                        {design.frontPreviewUrl && (
                          <img
                            src={design.frontPreviewUrl}
                            alt={design.name}
                            className="w-20 h-20 object-cover rounded border-2 border-gray-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {order.designs?.length || 0} design(s)
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm"
                  >
                    Voir les détails
                  </button>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => navigate(`/checkout?orderId=${order.id}`)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                    >
                      Commander
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Commande #{selectedOrder.id}</h2>
                  <p className="text-gray-600 mt-1">
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Statut de la commande</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  {getStatusIcon(selectedOrder.status)}
                </div>
              </div>

              {/* Designs */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Vos designs</h3>
                <div className="space-y-4">
                  {selectedOrder.designs?.map((design) => (
                    <div key={design.id} className="border-2 border-gray-200 rounded-lg p-4 flex gap-4">
                      {design.frontPreviewUrl && (
                        <img
                          src={design.frontPreviewUrl}
                          alt={design.name}
                          className="w-24 h-24 object-cover rounded border-2 border-black"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{design.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">Quantités commandées:</p>
                        <div className="grid grid-cols-6 gap-2 mt-2">
                          {design.quantities && Object.entries(design.quantities).map(([size, qty]) => (
                            qty > 0 && (
                              <div key={size} className="text-sm bg-gray-100 px-2 py-1 rounded">
                                <span className="font-semibold">{size}:</span> {qty}
                              </div>
                            )
                          ))}
                        </div>
                        <p className="mt-2 font-semibold text-gray-900">
                          Prix: {design.finalPrice?.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {selectedOrder.totalPrice?.toFixed(2)} €
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">TTC, frais de port inclus</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
