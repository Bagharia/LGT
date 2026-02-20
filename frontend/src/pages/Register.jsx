import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

const Register = () => {
  useSEO({ title: 'Créer un compte', path: '/register' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    accountType: 'personal',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountType: formData.accountType
      });
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#0D2137] items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-cyan-400 to-accent flex items-center justify-center">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="font-space-grotesk text-3xl font-bold text-white mb-4">
            Rejoignez notre communauté
          </h2>
          <p className="text-text-muted text-lg max-w-sm mx-auto">
            Des milliers de créateurs nous font déjà confiance pour leurs designs personnalisés.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12">
            <div>
              <div className="font-space-grotesk text-3xl font-bold text-accent">10K+</div>
              <div className="text-text-muted text-sm">Membres</div>
            </div>
            <div>
              <div className="font-space-grotesk text-3xl font-bold text-accent">50K+</div>
              <div className="text-text-muted text-sm">Designs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="font-space-grotesk text-3xl font-bold text-white mb-12 block">
            LGT<span className="text-accent">.</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
              Créer un compte
            </h1>
            <p className="text-text-muted text-lg">
              Rejoignez LGT et créez vos t-shirts personnalisés
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-muted mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-muted mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
                Email <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-2">
                Mot de passe <span className="text-accent">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
                minLength={6}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-muted mb-2">
                Confirmer le mot de passe <span className="text-accent">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
                minLength={6}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Pro Account Toggle */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, accountType: formData.accountType === 'pro' ? 'personal' : 'pro' })}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                formData.accountType === 'pro'
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.accountType === 'pro' ? 'bg-accent/20' : 'bg-white/10'
                }`}>
                  <svg className={`w-5 h-5 ${formData.accountType === 'pro' ? 'text-accent' : 'text-white/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${formData.accountType === 'pro' ? 'text-white' : 'text-white/70'}`}>
                      Compte Professionnel
                    </span>
                    {formData.accountType === 'pro' && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">PRO</span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">
                    Minimum 20 articles par commande
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  formData.accountType === 'pro' ? 'border-accent bg-accent' : 'border-white/30'
                }`}>
                  {formData.accountType === 'pro' && (
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  Création...
                </>
              ) : (
                <>
                  Créer mon compte
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-text-muted">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
