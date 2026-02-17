import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import Header from '../components/Header';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      const cats = data.categories || [];
      setCategories(cats);

      // Check for ?category=slug in URL
      const categorySlug = searchParams.get('category');
      const matchedCat = categorySlug && cats.find(c => c.slug === categorySlug);

      if (matchedCat) {
        setActiveCategory(matchedCat.id);
      } else if (cats.length > 0) {
        setActiveCategory(cats[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setLoading(false);
    }
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory);
  const visibleProducts = activeCategoryData?.products || [];

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-8 md:px-16">
        <div className="max-w-4xl">
          <div className="hero-tag mb-6">
            Collection 2026
          </div>
          <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Notre <span className="accent">Collection</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl">
            Choisissez votre produit et personnalisez-le selon vos envies.
            Qualité premium, designs uniques.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      {!loading && categories.length > 1 && (
        <section className="px-8 md:px-16 pb-8">
          <div className="flex gap-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-accent text-primary shadow-lg shadow-accent/30'
                    : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="px-8 md:px-16 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="product-card group"
              >
                <Link to={`/product/${product.id}`} className="relative overflow-hidden rounded-2xl bg-[#0D2137] block">
                  <img
                    src={product.mockupFrontUrl || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop'}
                    alt={product.name}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="product-tag">
                      {index === 0 ? 'Populaire' : 'Nouveau'}
                    </span>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-space-grotesk text-xl font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-text-muted text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-accent">
                      {product.basePrice.toFixed(2)} €
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-text-muted hover:text-accent transition-colors flex items-center gap-2"
                    >
                      Voir
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#0D2137] flex items-center justify-center">
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-space-grotesk text-2xl font-bold text-white mb-3">
              Aucun produit disponible
            </h3>
            <p className="text-text-muted">
              Revenez bientôt pour découvrir notre nouvelle collection.
            </p>
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

export default Products;
