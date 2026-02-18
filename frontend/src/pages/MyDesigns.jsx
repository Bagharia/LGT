import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { designsAPI, categoriesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Header from '../components/Header';

const MyDesigns = () => {
  const toast = useToast();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('tshirt'); // 'tshirt' or 'poster'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [designsData, categoriesData] = await Promise.all([
        designsAPI.getMy().catch(err => { console.error('Designs error:', err); return { designs: [] }; }),
        categoriesAPI.getAll(),
      ]);
      setDesigns(designsData.designs);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
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
      toast.error('Erreur lors de la suppression du design');
    }
  };

  // Séparer les designs par type
  const isPosterDesign = (design) => design.product?.category?.hasTwoSides === false;
  const tshirtDesigns = designs.filter(d => !isPosterDesign(d));
  const posterDesigns = designs.filter(d => isPosterDesign(d));

  // Trouver un produit par défaut pour chaque type
  const tshirtCategory = categories.find(c => c.hasTwoSides === true);
  const posterCategory = categories.find(c => c.hasTwoSides === false);
  const defaultTshirtProduct = tshirtCategory?.products?.[0];
  const defaultPosterProduct = posterCategory?.products?.[0];

  const currentDesigns = activeTab === 'tshirt' ? tshirtDesigns : posterDesigns;

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-8 md:px-16">
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
      </section>

      {/* Type Selection Cards */}
      <section className="px-8 md:px-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {/* T-shirt Card */}
          <button
            onClick={() => setActiveTab('tshirt')}
            className={`relative group rounded-2xl p-6 border-2 transition-all duration-300 text-left ${
              activeTab === 'tshirt'
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* T-shirt Icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'tshirt' ? 'bg-accent/20' : 'bg-white/10'
              }`}>
                <svg className={`w-8 h-8 ${activeTab === 'tshirt' ? 'text-accent' : 'text-white/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2L1 7l3 2 1-3h2.5m0 0C8 6 9 8 12 8s4-2 4.5-2m0 0H19l1 3 3-2-5.5-5M16.5 6v0M7.5 6L7 22h10l-.5-16" />
                </svg>
              </div>
              <div>
                <h3 className={`font-space-grotesk text-xl font-bold mb-1 ${
                  activeTab === 'tshirt' ? 'text-white' : 'text-white/80'
                }`}>
                  T-Shirts
                </h3>
                <p className="text-text-muted text-sm">
                  {tshirtDesigns.length} design{tshirtDesigns.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {activeTab === 'tshirt' && (
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-accent"></div>
            )}
          </button>

          {/* Poster Card */}
          <button
            onClick={() => setActiveTab('poster')}
            className={`relative group rounded-2xl p-6 border-2 transition-all duration-300 text-left ${
              activeTab === 'poster'
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Poster/Frame Icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'poster' ? 'bg-accent/20' : 'bg-white/10'
              }`}>
                <svg className={`w-8 h-8 ${activeTab === 'poster' ? 'text-accent' : 'text-white/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <rect x="5" y="5" width="14" height="14" rx="1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l4-4 3 3 2-2 5 5" />
                </svg>
              </div>
              <div>
                <h3 className={`font-space-grotesk text-xl font-bold mb-1 ${
                  activeTab === 'poster' ? 'text-white' : 'text-white/80'
                }`}>
                  Posters
                </h3>
                <p className="text-text-muted text-sm">
                  {posterDesigns.length} design{posterDesigns.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {activeTab === 'poster' && (
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-accent"></div>
            )}
          </button>
        </div>
      </section>

      {/* Designs Grid */}
      <section className="px-8 md:px-16 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Design Card */}
            {activeTab === 'tshirt' && (
              <Link
                to={defaultTshirtProduct ? `/editor/${defaultTshirtProduct.id}` : '/products?category=t-shirts'}
                className="group bg-[#0D2137] rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-accent/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[320px]"
              >
                <div className="w-20 h-20 rounded-2xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-space-grotesk text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                  Nouveau T-Shirt
                </span>
                <span className="text-text-muted text-sm mt-1">
                  Créer un design personnalisé
                </span>
              </Link>
            )}
            {activeTab === 'poster' && (
              <Link
                to={defaultPosterProduct ? `/poster-editor/${defaultPosterProduct.id}` : '/products?category=posters'}
                className="group bg-[#0D2137] rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-accent/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[320px]"
              >
                <div className="w-20 h-20 rounded-2xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-space-grotesk text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                  Nouveau Poster
                </span>
                <span className="text-text-muted text-sm mt-1">
                  Créer un poster avec cadre
                </span>
              </Link>
            )}

            {/* Existing Designs */}
            {currentDesigns.map((design) => {
              const isPoster = isPosterDesign(design);
              const editUrl = isPoster
                ? `/poster-editor/${design.productId}?designId=${design.id}`
                : `/editor/${design.productId}?designId=${design.id}`;

              return (
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
                        {isPoster ? (
                          <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <rect x="5" y="5" width="14" height="14" rx="1" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l4-4 3 3 2-2 5 5" />
                          </svg>
                        ) : (
                          <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white/80">
                        {isPoster ? 'Poster' : 'T-Shirt'}
                      </span>
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Link
                        to={editUrl}
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
                          {design.finalPrice.toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hint text when no designs */}
        {!loading && currentDesigns.length === 0 && (
          <p className="text-center text-text-muted mt-8">
            Cliquez sur le "+" ci-dessus pour créer votre premier {activeTab === 'tshirt' ? 'T-Shirt' : 'Poster'}.
          </p>
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
