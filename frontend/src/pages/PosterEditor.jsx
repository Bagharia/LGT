import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, designsAPI, ordersAPI } from '../services/api';

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

const PosterEditor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewRef = useRef(null);
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
      alert('Produit non trouvé');
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
      alert('Veuillez uploader une image');
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

      alert('Design sauvegardé !');
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleOrder = async () => {
    const totalArticles = Object.values(quantities).reduce((sum, q) => sum + q, 0);
    if (totalArticles === 0) {
      alert('Veuillez sélectionner au moins une quantité');
      return;
    }
    if (!posterImage) {
      alert('Veuillez uploader une image');
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
      alert(error.response?.data?.error || 'Erreur lors de la commande');
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

  const totalArticles = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const pricePerItem = product?.basePrice || 0.01;
  const totalPrice = totalArticles * pricePerItem;
  const discount = totalArticles >= 6 ? 0.10 : 0;
  const finalPrice = totalPrice * (1 - discount);

  // Frame dimensions for preview (proportional)
  const fmt = FORMATS[activeFormat];
  const maxH = 450;
  const scale = maxH / fmt.height;
  const frameW = fmt.width * scale;
  const frameH = fmt.height * scale;
  const borderWidth = 16;

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
          <div
            ref={previewRef}
            className="relative"
            style={{
              width: frameW + borderWidth * 2,
              height: frameH + borderWidth * 2,
              backgroundColor: frameColor,
              borderRadius: '4px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              padding: borderWidth,
            }}
          >
            {/* Inner white mat */}
            <div
              style={{
                width: frameW,
                height: frameH,
                backgroundColor: '#F5F5F0',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
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
                      <span className="w-8 text-center text-white font-medium">{quantities[key]}</span>
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
                disabled={saving || !posterImage || totalArticles === 0}
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
