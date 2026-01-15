import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      loadOrder();
    } else {
      navigate('/my-orders');
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

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.address || !formData.city || !formData.zipCode) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);

      // Ici, vous pourrez ajouter l'intégration Stripe plus tard
      // Pour l'instant, on simule juste une confirmation de commande

      alert('Commande confirmée ! Vous allez être redirigé vers vos commandes.');
      navigate('/my-orders');

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire de livraison */}
        <div className="bg-white rounded-xl shadow-md border-2 border-black p-6">
          <h2 className="text-2xl font-bold mb-6">Informations de livraison</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pays *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-lg disabled:bg-gray-400"
            >
              {submitting ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </form>
        </div>

        {/* Récapitulatif de la commande */}
        <div>
          <div className="bg-white rounded-xl shadow-md border-2 border-black p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-6">Récapitulatif</h2>

            <div className="space-y-4 mb-6">
              {order?.designs?.map((design) => (
                <div key={design.id} className="flex gap-4 border-b border-gray-200 pb-4">
                  {design.frontPreviewUrl && (
                    <img
                      src={design.frontPreviewUrl}
                      alt={design.name}
                      className="w-20 h-20 object-cover rounded border-2 border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{design.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {design.quantities && Object.entries(design.quantities).map(([size, qty]) => (
                        qty > 0 && (
                          <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {size}: {qty}
                          </span>
                        )
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {design.finalPrice?.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{order?.totalPrice?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>{order?.totalPrice?.toFixed(2)} €</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">Livraison gratuite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
