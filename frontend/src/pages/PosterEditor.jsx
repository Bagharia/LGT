import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, designsAPI, ordersAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const FRAME_COLORS = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Bois naturel', value: '#C4A882' },
  { name: 'Bois foncé', value: '#5C3A1E' },
  { name: 'Gris', value: '#808080' },
];

const FORMATS = {
  A4: { width: 210, height: 297, label: 'A4 (21×29.7 cm)' },
  A3: { width: 297, height: 420, label: 'A3 (29.7×42 cm)' },
};

// Lighten or darken a hex color by a percentage
const adjustColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(2.55 * percent)));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const PosterEditor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewRef = useRef(null);
  const toast = useToast();
  const { isPro } = useAuth();
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Poster state
  const [posterImage, setPosterImage] = useState(null);
  const [frameColor, setFrameColor] = useState('#000000');
  const [activeFormat, setActiveFormat] = useState('A4');
  const [designLoaded, setDesignLoaded] = useState(false);

  // Quantities per format
  const [quantities, setQuantities] = useState({ A3: 0, A4: 0 });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Load existing design if designId in URL
  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId && product && !designLoaded) {
      loadDesign(designId);
      setDesignLoaded(true);
    }
  }, [searchParams, product, designLoaded]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(productId);
      setProduct(data.product);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Produit non trouvé');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadDesign = async (designId) => {
    try {
      const data = await designsAPI.getById(designId);
      const design = data.design;

      if (design.posterImageUrl) setPosterImage(design.posterImageUrl);
      if (design.frameColor) setFrameColor(design.frameColor);
      if (design.posterFormat) setActiveFormat(design.posterFormat);
      if (design.quantities) setQuantities(design.quantities);
    } catch (error) {
      console.error('Erreur chargement design:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPosterImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPosterImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generatePreview = async () => {
    if (!previewRef.current) return null;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0A1931',
        scale: 1,
      });
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!posterImage) {
      toast.warning('Veuillez uploader une image');
      return;
    }

    try {
      setSaving(true);
      const frontPreview = await generatePreview();
      const designId = searchParams.get('designId');

      const designData = {
        productId: parseInt(productId),
        frontDesignJson: JSON.stringify({ posterImageUrl: posterImage, frameColor, posterFormat: activeFormat }),
        frontPreviewUrl: frontPreview,
        backDesignJson: null,
        backPreviewUrl: null,
        name: `Poster ${new Date().toLocaleDateString()}`,
        posterImageUrl: posterImage,
        frameColor,
        posterFormat: activeFormat,
        quantities,
      };

      if (designId) {
        await designsAPI.update(designId, designData);
      } else {
        const saved = await designsAPI.save(designData);
        const newId = saved.design.id;
        navigate(`/poster-editor/${productId}?designId=${newId}`, { replace: true });
      }

      toast.success('Design sauvegardé !');
      navigate('/my-designs');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleOrder = async () => {
    const totalArticles = Object.values(quantities).reduce((sum, q) => sum + q, 0);
    if (totalArticles === 0) {
      toast.warning('Veuillez sélectionner au moins une quantité');
      return;
    }
    if (!posterImage) {
      toast.warning('Veuillez uploader une image');
      return;
    }

    try {
      setSaving(true);
      const frontPreview = await generatePreview();
      const designId = searchParams.get('designId');

      const pricePerItem = product?.basePrice || 0.01;
      const totalPrice = totalArticles * pricePerItem;
      const discount = totalArticles >= 6 ? 0.10 : 0;
      const finalPrice = totalPrice * (1 - discount);

      const designData = {
        productId: parseInt(productId),
        frontDesignJson: JSON.stringify({ posterImageUrl: posterImage, frameColor, posterFormat: activeFormat }),
        frontPreviewUrl: frontPreview,
        backDesignJson: null,
        backPreviewUrl: null,
        name: `Poster ${new Date().toLocaleDateString()}`,
        posterImageUrl: posterImage,
        frameColor,
        posterFormat: activeFormat,
        quantities,
        totalPrice,
        finalPrice,
      };

      let finalDesignId;
      if (designId) {
        await designsAPI.update(designId, designData);
        finalDesignId = parseInt(designId);
      } else {
        const saved = await designsAPI.save(designData);
        finalDesignId = saved.design.id;
      }

      const orderResult = await ordersAPI.create({
        designs: [{
          designId: finalDesignId,
          quantities,
          finalPrice,
        }],
        totalPrice: finalPrice,
      });

      navigate(`/checkout?orderId=${orderResult.order.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la commande');
    } finally {
      setSaving(false);
    }
  };

  const updateQuantity = (format, delta) => {
    setQuantities(prev => ({
      ...prev,
      [format]: Math.max(0, prev[format] + delta),
    }));
  };

  const handleQuantityInput = (format, value) => {
    const num = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [format]: Math.max(0, num),
    }));
  };

  const totalArticles = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const pricePerItem = product?.basePrice || 0.01;
  const totalPrice = totalArticles * pricePerItem;
  const discount = totalArticles >= 6 ? 0.10 : 0;
  const finalPrice = totalPrice * (1 - discount);

  // Validation pro : minimum 20 articles
  const isProAccount = isPro();
  const proMinArticles = 20;
  const proCanOrder = !isProAccount || totalArticles >= proMinArticles;

  // Frame dimensions for preview (proportional)
  const fmt = FORMATS[activeFormat];
  const maxH = 450;
  const scale = maxH / fmt.height;
  const frameW = fmt.width * scale;
  const frameH = fmt.height * scale;
  const frameThickness = 20;
  const matWidth = 24; // Passe-partout width

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Produit non trouvé</p>
          <Link to="/products" className="btn-primary">Retour aux produits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between shrink-0" style={{ background: 'rgba(10, 25, 49, 0.95)' }}>
        <div className="flex items-center gap-4">
          <Link to="/products" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:border-accent/50 transition-colors" title="Retour">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link to="/" className="font-space-grotesk text-xl font-bold text-white tracking-tight">
            LGT<span className="text-accent">.</span>
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-text-muted text-sm">{product?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/my-designs" className="text-text-muted hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Mes Designs
          </Link>
          <Link to="/my-orders" className="text-text-muted hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Commandes
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Center - Preview */}
        <div className="flex-1 flex items-center justify-center p-8">
          {/* Wall shadow */}
          <div
            ref={previewRef}
            className="relative"
            style={{
              width: frameW + (frameThickness + matWidth) * 2,
              height: frameH + (frameThickness + matWidth) * 2,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4)) drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            }}
          >
            {/* Outer frame edge (3D effect - light edge) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: frameColor,
                borderRadius: '2px',
                boxShadow: `
                  inset 2px 2px 4px rgba(255,255,255,0.15),
                  inset -1px -1px 3px rgba(0,0,0,0.3)
                `,
              }}
            />

            {/* Frame body with depth */}
            <div
              style={{
                position: 'absolute',
                inset: 3,
                background: `linear-gradient(145deg,
                  ${adjustColor(frameColor, 15)},
                  ${frameColor} 30%,
                  ${adjustColor(frameColor, -10)} 70%,
                  ${adjustColor(frameColor, -20)}
                )`,
                borderRadius: '1px',
                boxShadow: `
                  inset 1px 1px 2px rgba(255,255,255,0.1),
                  inset -1px -1px 2px rgba(0,0,0,0.15)
                `,
              }}
            />

            {/* Inner frame edge (shadow into mat) */}
            <div
              style={{
                position: 'absolute',
                inset: frameThickness - 2,
                boxShadow: `
                  inset 2px 2px 6px rgba(0,0,0,0.4),
                  inset -1px -1px 4px rgba(0,0,0,0.2)
                `,
                borderRadius: '1px',
              }}
            />

            {/* Mat (passe-partout) */}
            <div
              style={{
                position: 'absolute',
                top: frameThickness,
                left: frameThickness,
                right: frameThickness,
                bottom: frameThickness,
                backgroundColor: '#F5F3EE',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            />

            {/* Mat bevel (inner edge of mat, slight shadow toward image) */}
            <div
              style={{
                position: 'absolute',
                top: frameThickness + matWidth - 2,
                left: frameThickness + matWidth - 2,
                right: frameThickness + matWidth - 2,
                bottom: frameThickness + matWidth - 2,
                boxShadow: `
                  inset 1px 1px 3px rgba(0,0,0,0.15),
                  inset -1px -1px 1px rgba(255,255,255,0.3)
                `,
              }}
            />

            {/* Image area */}
            <div
              style={{
                position: 'absolute',
                top: frameThickness + matWidth,
                left: frameThickness + matWidth,
                width: frameW,
                height: frameH,
                backgroundColor: '#FAFAF7',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {posterImage ? (
                <img
                  src={posterImage}
                  alt="Poster"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Uploadez votre image</p>
                </div>
              )}
            </div>

            {/* Glass reflection effect */}
            <div
              style={{
                position: 'absolute',
                top: frameThickness,
                left: frameThickness,
                right: frameThickness,
                bottom: frameThickness,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[360px] border-l border-white/10 bg-[#0D2137] overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Upload Section */}
            <div>
              <h3 className="text-white font-semibold mb-3">Image du poster</h3>
              <div
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {posterImage ? (
                  <div>
                    <img src={posterImage} alt="Preview" className="max-h-32 mx-auto rounded-lg mb-3" />
                    <p className="text-text-muted text-sm">Cliquez pour changer l'image</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-text-muted text-sm">Cliquez ou glissez une image ici</p>
                    <p className="text-text-muted text-xs mt-1">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="text-white font-semibold mb-3">Format</h3>
              <div className="flex gap-3">
                {Object.entries(FORMATS).map(([key, fmt]) => (
                  <button
                    key={key}
                    onClick={() => setActiveFormat(key)}
                    className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                      activeFormat === key
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{key}</div>
                    <div className="text-xs opacity-70">{fmt.width/10}×{fmt.height/10} cm</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Color */}
            <div>
              <h3 className="text-white font-semibold mb-3">Couleur du cadre</h3>
              <div className="flex gap-3 flex-wrap">
                {FRAME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFrameColor(color.value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      frameColor === color.value
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#0D2137] border-accent'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-white/10" />

            {/* Quantities */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quantités</h3>
              <div className="space-y-3">
                {Object.entries(FORMATS).map(([key, fmt]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-white font-medium">{key}</span>
                      <span className="text-text-muted text-sm ml-2">({fmt.width/10}×{fmt.height/10} cm)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(key, -1)}
                        disabled={quantities[key] === 0}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={quantities[key]}
                        onChange={(e) => handleQuantityInput(key, e.target.value)}
                        className="w-14 text-center text-white font-medium bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-accent/50"
                      />
                      <button
                        onClick={() => updateQuantity(key, 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-sm text-text-muted mb-2">
                <span>Prix unitaire</span>
                <span>{pricePerItem.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted mb-2">
                <span>{totalArticles} article{totalArticles > 1 ? 's' : ''}</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400 mb-2">
                  <span>Réduction -10%</span>
                  <span>-{(totalPrice * discount).toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-xl mt-3">
                <span>Total</span>
                <span className="text-accent">{finalPrice.toFixed(2)} €</span>
              </div>
            </div>

            {/* Pro account info */}
            {isProAccount && (
              <div className={`p-3 rounded-lg border ${proCanOrder ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${proCanOrder ? 'text-green-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className={`text-sm font-medium ${proCanOrder ? 'text-green-400' : 'text-yellow-400'}`}>
                    Compte Pro — {proCanOrder
                      ? `${totalArticles} articles`
                      : `${totalArticles}/${proMinArticles} articles (min. ${proMinArticles})`
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Acompte alert for 30+ articles */}
            {totalArticles >= 30 && (
              <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/30">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-300">
                    Pour les commandes de 30 articles et plus, un acompte sera demandé à la validation.
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saving || !posterImage}
                className="w-full py-3 rounded-xl font-semibold border-2 border-accent text-accent hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder le design'}
              </button>
              <button
                onClick={handleOrder}
                disabled={saving || !posterImage || totalArticles === 0 || !proCanOrder}
                className="w-full py-4 rounded-xl font-semibold text-lg bg-accent text-primary hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'En cours...' : 'Commander'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterEditor;
