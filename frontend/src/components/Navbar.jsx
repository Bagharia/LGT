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

                {isAdmin() && (
                  <li>
                    <Link to="/admin" className="text-gray-300 hover:text-white font-medium transition-colors">
                      Admin
                    </Link>
                  </li>
                )}

                <li className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">{user.email}</span>
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