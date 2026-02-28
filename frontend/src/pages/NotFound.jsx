import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useSEO from '../hooks/useSEO';

const NotFound = () => {
  useSEO({ title: '404 — Page introuvable', path: '/404' });

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <p className="font-space-grotesk text-8xl md:text-[10rem] font-bold text-accent leading-none mb-4">
          404
        </p>
        <h1 className="font-space-grotesk text-3xl md:text-4xl font-bold text-white mb-4">
          Page introuvable
        </h1>
        <p className="text-text-muted text-lg max-w-md mb-10">
          Cette page n'existe pas ou a été déplacée. Revenez sur la page d'accueil pour continuer.
        </p>
        <Link to="/" className="btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>

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

export default NotFound;
