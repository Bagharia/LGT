import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('front');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productsAPI.getById(id);
      setProduct(data.product);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Produit non trouvé');
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setIsOrdering(true);

    try {
      // Créer les quantités par taille
      const quantities = {};
      SIZES.forEach(size => {
        quantities[size] = size === selectedSize ? quantity : 0;
      });

      // Calculer le prix total
      const totalPrice = product.basePrice * quantity;

      // Stocker les infos de commande dans localStorage pour le checkout
      const orderData = {
        type: 'ready-made', // Produit fini, non personnalisé
        productId: product.id,
        productName: product.name,
        productImage: product.mockupFrontUrl,
        quantities,
        unitPrice: product.basePrice,
        totalPrice,
      };

      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      navigate('/checkout');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
          <h1 className="text-3xl font-bold text-white mb-4">Produit non trouvé</h1>
          <Link to="/products" className="btn-primary">
            Retour à la collection
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = selectedImage === 'front' ? product.mockupFrontUrl : product.mockupBackUrl;
  const totalPrice = (product.basePrice * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <div className="pt-24 px-8 md:px-16 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-text-muted">
            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-white transition-colors">Collection</Link></li>
            <li>/</li>
            <li className="text-white">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-[#111] rounded-2xl overflow-hidden border border-white/10">
              <img
                src={currentImage || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=90&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4">
              {product.mockupFrontUrl && (
                <button
                  onClick={() => setSelectedImage('front')}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === 'front' ? 'border-accent' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={product.mockupFrontUrl}
                    alt="Vue avant"
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
              {product.mockupBackUrl && (
                <button
                  onClick={() => setSelectedImage('back')}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === 'back' ? 'border-accent' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={product.mockupBackUrl}
                    alt="Vue arrière"
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:py-8">
            <div className="sticky top-32">
              {/* Badge */}
              <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-sm font-medium rounded-full mb-4">
                Collection LGT
              </span>

              {/* Title */}
              <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-bold text-accent mb-6">
                {product.basePrice.toFixed(2)} €
              </p>

              {/* Description */}
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                {product.description || 'T-shirt de haute qualité avec design exclusif LGT. Disponible en plusieurs tailles.'}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Taille</label>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-accent text-primary'
                          : 'bg-white/5 text-white border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">Quantité</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-white hover:text-accent transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center text-white font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-white hover:text-accent transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-text-muted">
                    Total: <span className="text-white font-bold">{totalPrice} €</span>
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleBuyNow}
                disabled={isOrdering}
                className="btn-primary w-full justify-center text-lg py-4 disabled:opacity-50"
              >
                {isOrdering ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Acheter maintenant - {totalPrice} €
                  </>
                )}
              </button>

              {/* Features */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-text-muted">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% Coton Bio Premium</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Design exclusif LGT</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Livraison gratuite dès 50€</span>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <svg className="w-6 h-6 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-white font-medium">Livraison Express</p>
                    <p className="text-text-muted text-sm">2-4 jours ouvrés</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <svg className="w-6 h-6 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-white font-medium">Retours Gratuits</p>
                    <p className="text-text-muted text-sm">Sous 30 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ProductDetail;
