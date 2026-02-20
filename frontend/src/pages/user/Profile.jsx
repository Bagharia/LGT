import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, designsAPI, ordersAPI } from '../../services/api';
import Header from '../../components/Header';
import useSEO from '../../hooks/useSEO';

const Profile = () => {
  useSEO({ title: 'Mon profil', path: '/profile' });
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  // Changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = authAPI.getCurrentUser();
      setUser(userData);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Mot de passe modifié avec succès !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement du profil...</p>
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
        {/* Profile Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-primary text-4xl font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="hero-tag mb-2">Mon Compte</div>
              <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-2">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Mon Profil'}
              </h1>
              <p className="text-text-muted text-lg">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Créations</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-white mb-1">{stats.totalDesigns}</p>
            <p className="text-text-muted text-sm">Designs créés</p>
          </div>

          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">Achats</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-white mb-1">{stats.totalOrders}</p>
            <p className="text-text-muted text-sm">Commandes passées</p>
          </div>

          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="font-space-grotesk text-4xl font-bold text-accent mb-1">{stats.totalSpent.toFixed(2)} €</p>
            <p className="text-text-muted text-sm">Total dépensé</p>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden mb-8">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-space-grotesk text-2xl font-bold text-white">Informations du compte</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Prénom</label>
                <p className="text-lg text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  {user?.firstName || 'Non renseigné'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Nom</label>
                <p className="text-lg text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  {user?.lastName || 'Non renseigné'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted block mb-2">Email</label>
              <p className="text-lg text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                {user?.email}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Rôle</label>
                <p className="text-lg text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <span className={`inline-flex items-center gap-2 ${user?.role === 'ADMIN' ? 'text-accent' : ''}`}>
                    {user?.role === 'ADMIN' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Membre depuis</label>
                <p className="text-lg text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden mb-12">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-space-grotesk text-2xl font-bold text-white">Modifier le mot de passe</h2>
          </div>
          <div className="p-6">
            {passwordError && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {passwordSuccess}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">
                  Mot de passe actuel <span className="text-accent">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  disabled={passwordLoading}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-text-muted block mb-2">
                    Nouveau mot de passe <span className="text-accent">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    disabled={passwordLoading}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted block mb-2">
                    Confirmer le nouveau mot de passe <span className="text-accent">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    disabled={passwordLoading}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      Modifier le mot de passe
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/my-designs"
            className="group bg-[#0D2137] rounded-2xl border border-white/10 p-8 hover:border-accent/50 transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-space-grotesk text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  Mes Designs
                </h3>
                <p className="text-text-muted">Voir et gérer mes créations</p>
              </div>
              <svg className="w-6 h-6 text-text-muted group-hover:text-accent group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/my-orders"
            className="group bg-[#0D2137] rounded-2xl border border-white/10 p-8 hover:border-accent/50 transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-space-grotesk text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  Mes Commandes
                </h3>
                <p className="text-text-muted">Suivre mes commandes</p>
              </div>
              <svg className="w-6 h-6 text-text-muted group-hover:text-accent group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 md:px-16 py-8 mt-12">
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

export default Profile;
