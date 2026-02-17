import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { designsAPI, productsAPI } from '../services/api';
import Header from '../components/Header';

const MyDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultProductId, setDefaultProductId] = useState(1);

  useEffect(() => {
    loadDesigns();
    loadDefaultProduct();
  }, []);

  const loadDefaultProduct = async () => {
    try {
      const data = await productsAPI.getAll();
      if (data.products && data.products.length > 0) {
        // Chercher un t-shirt noir en premier, sinon prendre le premier produit
        const blackShirt = data.products.find(p =>
          p.name.toLowerCase().includes('noir') || p.name.toLowerCase().includes('black')
        );
        setDefaultProductId(blackShirt ? blackShirt.id : data.products[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit par défaut:', error);
    }
  };

  const loadDesigns = async () => {
    try {
      const data = await designsAPI.getMy();
      setDesigns(data.designs);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des designs:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      return;
    }

    try {
      await designsAPI.delete(id);
      setDesigns(designs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du design');
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-8 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="hero-tag mb-6">
              Mon Espace Créatif
            </div>
            <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Mes <span className="accent">Designs</span>
            </h1>
            <p className="text-xl text-text-muted max-w-xl">
              Retrouvez tous vos designs personnalisés et continuez à créer.
            </p>
          </div>
          <Link
            to={`/editor/${defaultProductId}`}
            className="btn-primary self-start md:self-auto"
          >
            Nouveau Design
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Designs Grid */}
      <section className="px-8 md:px-16 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="font-space-grotesk text-3xl font-bold text-white mb-4">
              Aucun design pour le moment
            </h3>
            <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
              Commencez à créer vos T-shirts personnalisés dès maintenant et laissez libre cours à votre créativité.
            </p>
            <Link to={`/editor/${defaultProductId}`} className="btn-primary">
              Créer mon premier design
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="group bg-[#0D2137] rounded-2xl overflow-hidden border border-white/10 hover:border-accent/50 transition-all duration-300"
              >
                {/* Preview Image */}
                <div className="relative aspect-square bg-[#0A1931] overflow-hidden">
                  {design.frontPreviewUrl ? (
                    <img
                      src={design.frontPreviewUrl}
                      alt={design.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link
                      to={`/editor/${design.productId}?designId=${design.id}`}
                      className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary hover:scale-110 transition-transform"
                      title="Modifier"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(design.id)}
                      className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-space-grotesk text-lg font-semibold text-white mb-2 truncate">
                    {design.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">
                      {new Date(design.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {design.finalPrice && (
                      <span className="text-accent font-semibold">
                        {design.finalPrice.toFixed(2)} EUR
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
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

export default MyDesigns;
