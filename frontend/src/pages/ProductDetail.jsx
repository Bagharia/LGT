import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import useSEO from '../hooks/useSEO';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const POSTER_FORMATS = ['A4', 'A3'];

const ProductDetail = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: product ? product.name : 'Produit',
    description: product ? `Personnalisez ${product.name} avec votre design unique. Qualité premium, livraison rapide en France.` : undefined,
    path: `/product/${id}`,
  });
  const [selectedImage, setSelectedImage] = useState('front');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFormat, setSelectedFormat] = useState('A4');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
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

  const loadReviews = async () => {
    try {
      const data = await reviewsAPI.getByProduct(id);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setReviewCount(data.count);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    if (userRating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewsAPI.create(id, { rating: userRating, comment: userComment });
      toast.success('Avis enregistré !');
      setUserRating(0);
      setUserComment('');
      loadReviews();
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setIsOrdering(true);

    try {
      // Créer les quantités par taille ou format
      const quantities = {};
      if (isPoster) {
        POSTER_FORMATS.forEach(fmt => {
          quantities[fmt] = fmt === selectedFormat ? quantity : 0;
        });
      } else {
        SIZES.forEach(size => {
          quantities[size] = size === selectedSize ? quantity : 0;
        });
      }

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
      toast.error('Erreur lors de la création de la commande');
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

  const isPoster = product.category?.hasTwoSides === false;
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
            <div className="aspect-[3/4] bg-[#0D2137] rounded-2xl overflow-hidden border border-white/10">
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
                {product.description || (isPoster ? 'Poster personnalisé avec cadre de qualité.' : 'T-shirt de haute qualité avec design exclusif LGT. Disponible en plusieurs tailles.')}
              </p>

              {/* Size Selection (T-shirts) or Format Selection (Posters) */}
              {isPoster ? (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Format</label>
                  <div className="flex flex-wrap gap-3">
                    {POSTER_FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-6 h-14 rounded-xl font-medium transition-all ${
                          selectedFormat === fmt
                            ? 'bg-accent text-primary'
                            : 'bg-white/5 text-white border border-white/10 hover:border-white/30'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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
              )}

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

              {/* Customize Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated()) {
                    navigate('/login', { state: { from: `/product/${id}` } });
                    return;
                  }
                  navigate(isPoster ? `/poster-editor/${id}` : `/editor/${id}`);
                }}
                className="w-full mt-3 py-4 rounded-xl font-semibold text-lg border-2 border-accent text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Personnaliser
              </button>

              {/* Features */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-text-muted">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isPoster ? 'Impression haute qualité' : '100% Coton Bio Premium'}</span>
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

      {/* Section Avis clients */}
      <section className="px-8 md:px-16 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="border-t border-white/10 pt-12 mb-10">
            <h2 className="font-space-grotesk text-3xl font-bold text-white mb-2">Avis clients</h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-6 h-6 ${s <= Math.round(averageRating) ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white font-bold text-lg">{averageRating.toFixed(1)}</span>
                <span className="text-text-muted">({reviewCount} avis)</span>
              </div>
            )}
          </div>

          {/* Formulaire */}
          <div className="bg-[#0D2137] rounded-2xl p-6 mb-10">
            <h3 className="text-white font-semibold text-lg mb-4">Laisser un avis</h3>
            <form onSubmit={handleSubmitReview}>
              {/* Étoiles interactives */}
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUserRating(s)}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1"
                  >
                    <svg className={`w-8 h-8 transition-colors ${s <= (hoveredStar || userRating) ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={userComment}
                onChange={e => setUserComment(e.target.value)}
                placeholder="Partagez votre expérience (optionnel)"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 mb-4"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmittingReview ? 'Envoi...' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des avis */}
          {reviews.length === 0 ? (
            <p className="text-text-muted text-center py-8">Aucun avis pour l'instant. Soyez le premier !</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-[#0D2137] rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar initiale */}
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                        {review.user.firstName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {review.user.firstName} {review.user.lastName?.[0]?.toUpperCase()}.
                        </p>
                        <div className="flex mt-1">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-text-muted text-sm flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-text-muted mt-3 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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

export default ProductDetail;
