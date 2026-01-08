import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products.slice(0, 4));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-black text-white rounded-2xl p-12 md:p-16 border border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Créez vos T-Shirts Uniques
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-400">
            Personnalisez vos vêtements avec notre éditeur en ligne intuitif
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg"
            >
              Voir les Produits
            </Link>
            <Link
              to="/my-designs"
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors border-2 border-white"
            >
              Commencer Maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Pourquoi choisir LGT T-Shirts ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border-2 border-black hover:bg-gray-50 transition-all text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Éditeur Intuitif</h3>
            <p className="text-gray-600">
              Créez facilement vos designs avec notre éditeur en ligne simple et puissant
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-black hover:bg-gray-50 transition-all text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Qualité Premium</h3>
            <p className="text-gray-600">
              T-shirts 100% coton de haute qualité pour un confort optimal
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-black hover:bg-gray-50 transition-all text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Prix Abordables</h3>
            <p className="text-gray-600">
              Des prix compétitifs sans compromis sur la qualité
            </p>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Nos Produits Populaires</h2>
          <Link to="/products" className="text-black hover:text-gray-600 font-semibold border-b-2 border-black hover:border-gray-600 transition-colors">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center border-b-2 border-black">
                  {product.mockupFrontUrl ? (
                    <img
                      src={product.mockupFrontUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-black">
                      {product.basePrice.toFixed(2)}€
                    </span>
                    <Link
                      to={`/editor/${product.id}`}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                      Personnaliser
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-gray-100 rounded-xl border-2 border-gray-300">
            <p className="text-gray-600 text-lg">Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white rounded-2xl p-12 text-center border border-gray-800">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Prêt à créer votre T-Shirt unique ?
        </h2>
        <p className="text-xl mb-8 text-gray-400">
          Rejoignez des milliers de clients satisfaits et créez votre design dès maintenant
        </p>
        <Link
          to="/my-designs"
          className="inline-block px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg"
        >
          Commencer la Création
        </Link>
      </section>
    </div>
  );
};

export default Home;
