import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full px-8 md:px-16 py-5 flex justify-between items-center z-50 mix-blend-difference">
      <Link to="/" className="font-space-grotesk text-2xl font-bold text-white tracking-tight">
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

      {/* Mobile menu button */}
      <button className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
