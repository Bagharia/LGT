import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Barre principale */}
      <div className="px-6 md:px-16 py-5 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="font-space-grotesk text-2xl font-bold text-white tracking-tight" onClick={closeMenu}>
          LGT<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link to="/products" className="nav-link">Collection</Link>
          <Link to="/my-designs" className="nav-link">Mes Designs</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/my-orders" className="nav-link">Commandes</Link>
              <button onClick={handleLogout} className="nav-btn">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="nav-btn">
                S'inscrire
              </Link>
            </>
          )}
        </nav>

        {/* Bouton hamburger mobile */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden" style={{ background: '#0A1931', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <nav className="flex flex-col px-6 py-4 gap-1">
            <Link to="/products" className="py-3 text-white font-medium border-b border-white/10" onClick={closeMenu}>Collection</Link>
            <Link to="/my-designs" className="py-3 text-white font-medium border-b border-white/10" onClick={closeMenu}>Mes Designs</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="py-3 text-white font-medium border-b border-white/10" onClick={closeMenu}>Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/my-orders" className="py-3 text-white font-medium border-b border-white/10" onClick={closeMenu}>Commandes</Link>
                <button
                  onClick={handleLogout}
                  className="mt-3 nav-btn text-center"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-3 text-white font-medium border-b border-white/10" onClick={closeMenu}>Connexion</Link>
                <Link to="/register" className="mt-3 nav-btn text-center block" onClick={closeMenu}>
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
