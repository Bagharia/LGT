import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide. Veuillez refaire une demande de réinitialisation.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="font-space-grotesk text-3xl font-bold text-white mb-12 block">
          LGT<span className="text-accent">.</span>
        </Link>

        {success ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-space-grotesk text-3xl font-bold text-white mb-4">
              Mot de passe réinitialisé !
            </h1>
            <p className="text-text-muted mb-8">
              Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la connexion...
            </p>
            <Link to="/login" className="btn-primary justify-center">
              Se connecter maintenant
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="font-space-grotesk text-4xl font-bold text-white mb-4">
                Nouveau mot de passe
              </h1>
              <p className="text-text-muted text-lg">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
                {!token && (
                  <div className="mt-3">
                    <Link to="/forgot-password" className="text-accent hover:underline font-medium">
                      Faire une nouvelle demande →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-muted mb-2">
                  Nouveau mot de passe <span className="text-accent">*</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading || !token}
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
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading || !token}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    Réinitialiser le mot de passe
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-text-muted">
              <Link to="/login" className="text-accent hover:underline font-medium">
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
