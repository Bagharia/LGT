import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import HeroCanvas from '../components/3D/HeroCanvas';
import Header from '../components/Header';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaderHidden, setLoaderHidden] = useState(false);

  useEffect(() => {
    loadProducts();

    // Hide loader after animation
    const timer = setTimeout(() => {
      setLoaderHidden(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Scroll reveal effect
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary min-h-screen">
      {/* Loader */}
      <div className={`loader ${loaderHidden ? 'hidden' : ''}`}>
        <div className="loader-text">LGT.</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero-content">
          <div className="hero-tag">
            Nouvelle Collection 2026
          </div>
          <h1>
            Créez Votre<br />
            <span className="accent">Style</span> Unique
          </h1>
          <p>
            T-shirts personnalisés premium pour ceux qui osent se démarquer.
            Design intuitif, qualité exceptionnelle, expression sans limites.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Explorer la Collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#showcase" className="btn-secondary">Voir le Lookbook</a>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          Scroll pour découvrir
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-section">
        <div className="marquee">
          <div className="marquee-content">
            <span>Livraison Gratuite</span>
            <div className="dot"></div>
            <span>Design Personnalisé</span>
            <div className="dot"></div>
            <span>Qualité Premium</span>
            <div className="dot"></div>
            <span>Édition Limitée</span>
            <div className="dot"></div>
          </div>
          <div className="marquee-content">
            <span>Livraison Gratuite</span>
            <div className="dot"></div>
            <span>Design Personnalisé</span>
            <div className="dot"></div>
            <span>Qualité Premium</span>
            <div className="dot"></div>
            <span>Édition Limitée</span>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="products-section" id="products">
        <div className="section-header reveal">
          <h2 className="section-title"><span className="number">01</span>Collection Vedette</h2>
          <Link to="/products" className="view-all">
            Voir Tout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`product-card reveal ${index === 0 ? 'featured' : ''}`}
              >
                <img
                  src={product.mockupFrontUrl || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1200&fit=crop'}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-overlay">
                  <span className="product-tag">
                    {index === 0 ? 'Bestseller' : index === 1 ? 'Nouveau' : 'Populaire'}
                  </span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{product.basePrice.toFixed(2)} EUR</p>
                </div>
                <Link to={`/product/${product.id}`} className="product-link-overlay" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header reveal">
          <h2 className="section-title"><span className="number">02</span>Pourquoi Nous Choisir</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card reveal">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="feature-title">Matériaux Premium</h3>
            <p className="feature-desc">100% coton bio, sourcé de manière responsable pour un confort ultime.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="feature-title">Mode Durable</h3>
            <p className="feature-desc">Production neutre en carbone avec emballage écologique pour un avenir plus vert.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="feature-title">Coupe Parfaite</h3>
            <p className="feature-desc">Silhouettes taillées par des experts pour mettre en valeur chaque morphologie.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 className="feature-title">Livraison Rapide</h3>
            <p className="feature-desc">Livraison gratuite mondiale avec options express disponibles.</p>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section" id="showcase">
        <div className="showcase-container">
          <div className="showcase-content reveal">
            <h2>Conçu pour les <span className="accent">Audacieux</span></h2>
            <p>
              Chaque couture raconte une histoire. Nos designers repoussent les limites pour créer
              des pièces qui ne sont pas simplement des vêtements — ce sont des déclarations.
              Du concept à la création, nous sommes obsédés par chaque détail.
            </p>
            <div className="stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Clients Satisfaits</div>
              </div>
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">Coton Bio</div>
              </div>
              <div className="stat">
                <div className="stat-number">48h</div>
                <div className="stat-label">Livraison Express</div>
              </div>
            </div>
          </div>
          <div className="showcase-visual reveal">
            <img
              src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=1000&fit=crop"
              alt="Showcase"
              className="showcase-image"
            />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container reveal">
          <h2>Rejoignez le <span className="accent">Mouvement</span></h2>
          <p>Soyez les premiers informés des nouvelles sorties, offres exclusives et conseils style.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Entrez votre email" />
            <button type="submit" className="btn-primary">
              S'abonner
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">LGT<span>.</span></Link>
            <p>T-shirts personnalisés premium pour ceux qui osent se démarquer. Design unique, qualité exceptionnelle.</p>
            <div className="social-links">
              <a href="#" className="social-link">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h4>Boutique</h4>
            <ul>
              <li><Link to="/products">Tous les Produits</Link></li>
              <li><Link to="/products">Nouveautés</Link></li>
              <li><Link to="/products">Bestsellers</Link></li>
              <li><Link to="/my-designs">Créer un Design</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Compte</h4>
            <ul>
              <li><Link to="/login">Connexion</Link></li>
              <li><Link to="/register">Inscription</Link></li>
              <li><Link to="/my-orders">Mes Commandes</Link></li>
              <li><Link to="/my-designs">Mes Designs</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Livraison</a></li>
              <li><a href="#">Retours</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 LGT. Tous droits réservés.</p>
          <p>Conçu avec passion en France</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
