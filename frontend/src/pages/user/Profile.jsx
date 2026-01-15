import { useState, useEffect } from 'react';
import { authAPI, designsAPI, ordersAPI } from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Charger les infos utilisateur
      const userData = authAPI.getCurrentUser();
      setUser(userData);

      // Charger les statistiques
      const [designsData, ordersData] = await Promise.all([
        designsAPI.getMy(),
        ordersAPI.getMy()
      ]);

      const totalSpent = ordersData.orders?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;

      setStats({
        totalDesigns: designsData.designs?.length || 0,
        totalOrders: ordersData.orders?.length || 0,
        totalSpent
      });

      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mes Designs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDesigns}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mes Commandes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Dépensé</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalSpent.toFixed(2)} €</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-md border-2 border-black overflow-hidden">
        <div className="p-6 border-b-2 border-black">
          <h2 className="text-xl font-bold text-gray-900">Informations du compte</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Rôle</label>
            <p className="text-lg font-semibold text-gray-900">
              {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Membre depuis</label>
            <p className="text-lg font-semibold text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/my-designs"
          className="bg-white rounded-xl shadow-md p-6 border-2 border-black hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mes Designs</h3>
              <p className="text-gray-600">Gérer mes créations</p>
            </div>
          </div>
        </a>

        <a
          href="/my-orders"
          className="bg-white rounded-xl shadow-md p-6 border-2 border-black hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mes Commandes</h3>
              <p className="text-gray-600">Suivre mes commandes</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Profile;
