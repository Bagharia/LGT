import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useSEO from '../hooks/useSEO';

const ComingSoon = () => {
  useSEO({ title: 'Bientôt disponible', path: '/coming-soon' });

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-space-grotesk text-6xl md:text-8xl font-bold text-accent leading-none mb-4">
          Bientôt
        </p>
        <h1 className="font-space-grotesk text-3xl md:text-4xl font-bold text-white mb-4">
          En cours de construction
        </h1>
        <p className="text-text-muted text-lg max-w-md mb-10">
          Cette page est en cours de développement. Revenez bientôt, on travaille dessus !
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
          <Link to="/"><img src="/removebg-preview.png" alt="LGT" className="h-8 w-auto object-contain" /></Link>
          <p className="text-text-muted text-sm">
            &copy; 2026 LGT. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
