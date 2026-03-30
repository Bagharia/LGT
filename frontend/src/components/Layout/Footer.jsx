import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary px-8 md:px-16 pt-20 pb-10 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div>
          <Link to="/"><img src="/removebg-preview.png" alt="LGT" className="h-10 w-auto object-contain" /></Link>
          <p className="text-text-muted leading-relaxed mb-8">
            T-shirts personnalisés premium pour ceux qui osent se démarquer. Design unique, qualité exceptionnelle.
          </p>
          <div className="flex gap-4">
<a href="https://www.instagram.com/lgt.entreprise/" className="social-link" target="_blank" rel="noopener noreferrer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@tgl952?lang=fr" className="social-link" target="_blank" rel="noopener noreferrer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-space-grotesk text-sm font-semibold uppercase tracking-widest text-white mb-6">
            Boutique
          </h4>
          <ul className="space-y-4">
            <li><Link to="/products" className="footer-link">Tous les Produits</Link></li>
            <li><Link to="/products" className="footer-link">Nouveautés</Link></li>
            <li><Link to="/products" className="footer-link">Bestsellers</Link></li>
            <li><Link to="/my-designs" className="footer-link">Créer un Design</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-space-grotesk text-sm font-semibold uppercase tracking-widest text-white mb-6">
            Mon Compte
          </h4>
          <ul className="space-y-4">
            <li><Link to="/login" className="footer-link">Connexion</Link></li>
            <li><Link to="/register" className="footer-link">Créer un Compte</Link></li>
            <li><Link to="/my-orders" className="footer-link">Mes Commandes</Link></li>
            <li><Link to="/my-designs" className="footer-link">Mes Designs</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-space-grotesk text-sm font-semibold uppercase tracking-widest text-white mb-6">
            Support
          </h4>
          <ul className="space-y-4">
            <li><Link to="/coming-soon" className="footer-link">Contact</Link></li>
            <li><Link to="/coming-soon" className="footer-link">FAQ</Link></li>
            <li><Link to="/coming-soon" className="footer-link">Livraison</Link></li>
            <li><Link to="/coming-soon" className="footer-link">Retours</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/10 text-text-muted text-sm">
        <p>&copy; 2026 LGT. Tous droits réservés.</p>
        <p>Conçu avec passion en France</p>
      </div>
    </footer>
  );
};

export default Footer;
