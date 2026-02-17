import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI } from '../services/api';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const collectionRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    categoriesAPI.getAll().then(data => {
      setCategories(data.categories || []);
    }).catch(() => {});
  }, []);

  // Close collection dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (collectionRef.current && !collectionRef.current.contains(e.target)) {
        setCollectionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/', label: 'Accueil' },
  ];

  const authLinks = [
    { path: '/my-designs', label: 'Mes Designs' },
    { path: '/my-orders', label: 'Commandes' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full px-6 md:px-16 py-4 flex justify-between items-center z-50 backdrop-blur-md border-b" style={{ background: 'rgba(10, 25, 49, 0.75)', borderColor: 'rgba(0, 210, 255, 0.15)', boxShadow: '0 0 30px rgba(0, 210, 255, 0.08)' }}>
      {/* Logo */}
      <Link to="/" className="font-space-grotesk text-2xl font-bold text-white tracking-tight">
        LGT<span className="text-accent">.</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {/* Main Links */}
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium transition-colors ${
              isActive(link.path)
                ? 'text-accent'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Collection Dropdown */}
        <div className="relative" ref={collectionRef}>
          <button
            onClick={() => setCollectionMenuOpen(!collectionMenuOpen)}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              location.pathname === '/products'
                ? 'text-accent'
                : 'text-text-muted hover:text-white'
            }`}
          >
            Collection
            <svg
              className={`w-3.5 h-3.5 transition-transform ${collectionMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {collectionMenuOpen && (
            <>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-[#0D2137] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <Link
                  to="/products"
                  onClick={() => setCollectionMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors border-b border-white/10 font-medium"
                >
                  Tout voir
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setCollectionMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Auth Links (when logged in) */}
        {isAuthenticated() && (
          <>
            {authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-accent'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin Link */}
            {isAdmin() && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-accent'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                Admin
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Right Side - Auth Actions */}
      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated() ? (
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-primary font-bold text-sm">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-white text-sm font-medium">
                {user?.firstName || 'Utilisateur'}
              </span>
              <svg
                className={`w-4 h-4 text-text-muted transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2137] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-text-muted text-sm truncate">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon Profil
                    </Link>
                    <Link
                      to="/my-designs"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Mes Designs
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Mes Commandes
                    </Link>

                    {isAdmin() && (
                      <>
                        <div className="border-t border-white/10 my-2" />
                        <Link
                          to="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-accent hover:bg-accent/10 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Panel Admin
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm py-2"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
      >
        {mobileMenuOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0D2137] border-b border-white/10 md:hidden">
          <nav className="px-6 py-4 space-y-2">
            {/* Main Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive(link.path)
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Collection with sub-links */}
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${
                isActive('/products')
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              Collection
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 pl-8 rounded-xl text-text-muted hover:bg-white/5 hover:text-white transition-colors text-sm"
              >
                {cat.name}
              </Link>
            ))}

            {isAuthenticated() ? (
              <>
                {/* Auth Links */}
                {authLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-colors ${
                      isActive(link.path)
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    isActive('/profile')
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  Mon Profil
                </Link>

                {isAdmin() && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-accent/10 text-accent'
                        : 'text-accent hover:bg-accent/10'
                    }`}
                  >
                    Panel Admin
                  </Link>
                )}

                <div className="border-t border-white/10 my-2" />

                {/* User Info */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-primary font-bold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-text-muted text-sm">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-white/10 my-2" />
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-text-muted hover:bg-white/5 hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl bg-accent text-primary font-medium text-center"
                >
                  Créer un compte
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
