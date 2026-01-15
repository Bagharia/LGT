import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
            LGT
          </Link>

          {/* Menu */}
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="/products" className="text-gray-300 hover:text-white font-medium transition-colors">
                Produits
              </Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link to="/my-designs" className="text-gray-300 hover:text-white font-medium transition-colors">
                    Mes Designs
                  </Link>
                </li>

                <li>
                  <Link to="/my-orders" className="text-gray-300 hover:text-white font-medium transition-colors">
                    Mes Commandes
                  </Link>
                </li>

                {isAdmin() && (
                  <li>
                    <Link to="/admin" className="text-gray-300 hover:text-white font-medium transition-colors">
                      Admin
                    </Link>
                  </li>
                )}

                <li>
                  <Link to="/profile" className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">{user.email}</span>
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;