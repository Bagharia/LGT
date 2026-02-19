import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email');
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

        {sent ? (
          /* État : email envoyé */
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-space-grotesk text-3xl font-bold text-white mb-4">
              Email envoyé !
            </h1>
            <p className="text-text-muted mb-2">
              Si l'adresse <span className="text-white font-medium">{email}</span> est associée à un compte, vous recevrez un lien de réinitialisation.
            </p>
            <p className="text-text-muted text-sm mb-8">
              Le lien expire dans 1 heure. Vérifiez aussi vos spams.
            </p>
            <Link to="/login" className="btn-primary justify-center">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* Formulaire */
          <>
            <div className="mb-10">
              <h1 className="font-space-grotesk text-4xl font-bold text-white mb-4">
                Mot de passe oublié
              </h1>
              <p className="text-text-muted text-lg">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le lien
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

export default ForgotPassword;
