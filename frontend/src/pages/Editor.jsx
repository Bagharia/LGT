import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, designsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import DesignCanvas from '../components/DesignEditor/Canvas';
import RightPanel from '../components/DesignEditor/RightPanel';
import * as fabric from 'fabric';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSide, setActiveSide] = useState('front');
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeToolSection, setActiveToolSection] = useState(null);
  const [tshirtColor, setTshirtColor] = useState('#FFFFFF');
  const [designLoaded, setDesignLoaded] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const isTwoSided = product?.category?.hasTwoSides ?? true;
  const activeCanvas = activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas;

  // Ajouter du texte automatiquement quand on clique sur le bouton Texte
  const handleTextClick = () => {
    setActiveToolSection('text');

    const canvas = activeSide === 'front' ? frontCanvas : (isTwoSided ? backCanvas : frontCanvas);
    if (!canvas) return;

    // Si un texte est déjà sélectionné, ouvrir le drawer sans ajouter un nouveau
    const active = canvas.getActiveObject();
    if (active && active.type === 'i-text') return;

    // Sinon ajouter un nouveau texte
    const text = new fabric.IText('Votre texte', {
      left: 250,
      top: 300,
      fontSize: 40,
      fill: '#000000',
      fontFamily: 'Arial',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Tracker l'objet sélectionné sur le canvas actif (pour bouton supprimer mobile)
  // Sur mobile : ouvrir le drawer texte automatiquement quand un texte est sélectionné
  useEffect(() => {
    const canvas = activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas;
    if (!canvas) return;
    const onSelect = () => {
      const obj = canvas.getActiveObject();
      setSelectedObject(obj);
    };
    const onClear = () => {
      setSelectedObject(null);
    };
    canvas.on('selection:created', onSelect);
    canvas.on('selection:updated', onSelect);
    canvas.on('selection:cleared', onClear);
    return () => {
      canvas.off('selection:created', onSelect);
      canvas.off('selection:updated', onSelect);
      canvas.off('selection:cleared', onClear);
    };
  }, [activeSide, frontCanvas, backCanvas, isTwoSided]);

  // Import image depuis la toolbar
  const handleImportImage = (e) => {
    const canvas = activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas;
    if (!canvas) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const img = await fabric.FabricImage.fromURL(event.target.result, { crossOrigin: 'anonymous' });
        const maxW = 240, maxH = 320;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1) * 0.5;
        img.set({ left: 130 + (maxW - img.width * scale) / 2, top: 80 + (maxH - img.height * scale) / 2, scaleX: scale, scaleY: scale });
        img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      } catch (err) { console.error(err); }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Supprimer l'objet sélectionné (bouton mobile)
  const handleDeleteSelected = () => {
    const canvas = activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); }
  };

  // Raccourcis clavier Ctrl+Z / Ctrl+Y / Delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      const canvas = activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          canvas?.undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          canvas?.redo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const obj = canvas?.getActiveObject();
        if (obj) {
          e.preventDefault();
          canvas.remove(obj);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSide, frontCanvas, backCanvas, isTwoSided]);

  // Générer le PNG d'aperçu quand le modal s'ouvre
  useEffect(() => {
    if (showPreview && activeCanvas) {
      const dataUrl = activeCanvas.toDataURL({ format: 'png', multiplier: 2 });
      setPreviewDataUrl(dataUrl);
    }
  }, [showPreview, activeCanvas]);

  // Charger le design si un designId est fourni dans l'URL
  useEffect(() => {
    const designId = searchParams.get('designId');
    const canvasesReady = frontCanvas && (isTwoSided ? backCanvas : true);
    if (designId && canvasesReady && !designLoaded) {
      loadDesign(designId);
      setDesignLoaded(true);
    }
  }, [searchParams, frontCanvas, backCanvas, designLoaded, isTwoSided]);

  const loadDesign = async (designId) => {
    try {
      const data = await designsAPI.getById(designId);
      const design = data.design;

      // Restaurer la couleur du t-shirt
      if (design.tshirtColor) {
        setTshirtColor(design.tshirtColor);
      }

      // Restaurer les objets sur le canvas front (sans le rectangle de zone)
      if (design.frontDesignJson && frontCanvas) {
        const frontData = JSON.parse(design.frontDesignJson);
        const userObjects = frontData.objects.slice(1);

        if (userObjects.length > 0) {
          for (const objData of userObjects) {
            if (objData.type === 'i-text' || objData.type === 'text' || objData.type === 'IText') {
              const { type, ...textProps } = objData;
              const text = new fabric.IText(objData.text || '', textProps);
              frontCanvas.add(text);
            } else if (objData.type === 'image' || objData.type === 'Image') {
              try {
                const img = await fabric.FabricImage.fromObject(objData);
                frontCanvas.add(img);
              } catch (error) {
                console.error('Error creating image:', error);
              }
            }
          }
          frontCanvas.renderAll();
        }
      }

      // Restaurer les objets sur le canvas back (sans le rectangle de zone)
      if (design.backDesignJson && backCanvas) {
        const backData = JSON.parse(design.backDesignJson);
        const userObjects = backData.objects.slice(1);

        if (userObjects.length > 0) {
          for (const objData of userObjects) {
            if (objData.type === 'i-text' || objData.type === 'text' || objData.type === 'IText') {
              const { type, ...textProps } = objData;
              const text = new fabric.IText(objData.text || '', textProps);
              backCanvas.add(text);
            } else if (objData.type === 'image' || objData.type === 'Image') {
              try {
                const img = await fabric.FabricImage.fromObject(objData);
                backCanvas.add(img);
              } catch (error) {
                console.error('Error creating back image:', error);
              }
            }
          }
          backCanvas.renderAll();
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du design:', error);
      toast.error('Erreur lors du chargement du design');
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(productId);
      setProduct(data.product);
      // Reset to front for single-sided products
      if (!data.product?.category?.hasTwoSides) {
        setActiveSide('front');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Produit non trouvé');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder le design (sans créer de commande)
  const handleSaveDesign = async () => {
    if (!frontCanvas) {
      toast.warning('Aucun design à sauvegarder');
      return;
    }

    try {
      setSaving(true);

      const frontJson = JSON.stringify(frontCanvas.toJSON());
      const backJson = isTwoSided && backCanvas ? JSON.stringify(backCanvas.toJSON()) : null;

      const frontPreview = frontCanvas.toDataURL({ format: 'png' });
      const backPreview = isTwoSided && backCanvas ? backCanvas.toDataURL({ format: 'png' }) : null;

      const designId = searchParams.get('designId');

      if (designId) {
        // Mettre à jour le design existant
        await designsAPI.update(designId, {
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          name: `Design ${new Date().toLocaleDateString()}`,
          tshirtColor: tshirtColor
        });
      } else {
        // Créer un nouveau design
        const savedDesign = await designsAPI.save({
          productId: parseInt(productId),
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          name: `Design ${new Date().toLocaleDateString()}`,
          tshirtColor: tshirtColor
        });
        // Mettre à jour l'URL avec le designId pour que les prochaines sauvegardes fassent un update
        const newDesignId = savedDesign.design.id;
        navigate(`/editor/${productId}?designId=${newDesignId}`, { replace: true });
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

  // Commander le design (sauvegarder + créer commande)
  const handleOrderDesign = async (quantities, totalPrice, finalPrice) => {
    if (!frontCanvas) {
      toast.warning('Aucun design à commander');
      return;
    }

    try {
      setSaving(true);

      const frontJson = JSON.stringify(frontCanvas.toJSON());
      const backJson = isTwoSided && backCanvas ? JSON.stringify(backCanvas.toJSON()) : null;
      const frontPreview = frontCanvas.toDataURL({ format: 'png' });
      const backPreview = isTwoSided && backCanvas ? backCanvas.toDataURL({ format: 'png' }) : null;

      if (!isAuthenticated()) {
        // Guest : stocker le design en localStorage et aller au checkout
        const guestDesign = {
          productId: parseInt(productId),
          productName: product?.name || 'Design personnalisé',
          productImage: frontPreview,
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          tshirtColor: tshirtColor,
          quantities: quantities,
          totalPrice: totalPrice,
          finalPrice: finalPrice,
        };
        localStorage.setItem('guestDesign', JSON.stringify(guestDesign));
        navigate('/checkout?guest=1');
        return;
      }

      const designId = searchParams.get('designId');
      let finalDesignId;

      if (designId) {
        await designsAPI.update(designId, {
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          name: `Design ${new Date().toLocaleDateString()}`,
          quantities, totalPrice, finalPrice, tshirtColor
        });
        finalDesignId = parseInt(designId);
      } else {
        const savedDesign = await designsAPI.save({
          productId: parseInt(productId),
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          name: `Design ${new Date().toLocaleDateString()}`,
          quantities, totalPrice, finalPrice, tshirtColor
        });
        finalDesignId = savedDesign.design.id;
      }

      const orderResult = await ordersAPI.create({
        designs: [{ designId: finalDesignId, quantities, finalPrice }],
        totalPrice: finalPrice
      });

      navigate(`/checkout?orderId=${orderResult.order.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la commande');
    } finally {
      setSaving(false);
    }
  };

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
          <Link to="/products" className="btn-primary">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-layout">
      {/* Editor Header */}
      <header className="editor-header">
        <div className="flex items-center gap-4">
          <Link to="/products" className="editor-back-btn" title="Retour">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link to="/"><img src="/removebg-preview.png" alt="LGT" className="h-8 w-auto object-contain" /></Link>
          <span className="text-white/30">|</span>
          <span className="text-text-muted text-sm">{product?.name}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/my-designs" className="editor-nav-link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Mes Designs
          </Link>
          <Link to="/my-orders" className="editor-nav-link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Commandes
          </Link>
        </div>
      </header>

      {/* Div principale - contient tout */}
      <div className="editor-container">

        {/* Div Toggle - Barre de gauche */}
        <div className="editor-toggle-left">
          <button
            className={`toggle-btn ${activeToolSection === 'text' ? 'active' : ''}`}
            onClick={handleTextClick}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            <span>Texte</span>
          </button>
<label htmlFor="editor-import-input" className="toggle-btn cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Importer</span>
          </label>
          <input id="editor-import-input" type="file" accept="image/*" onChange={handleImportImage} className="sr-only" />
          <button
            className={`toggle-btn ${activeToolSection === null ? 'active' : ''}`}
            onClick={() => setActiveToolSection(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Produits</span>
          </button>
          <button
            className={`toggle-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? 'Masquer la grille' : 'Afficher la grille'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M4 13h16M4 17h16M9 4v16M13 4v16M17 4v16" />
            </svg>
            <span>Grille</span>
          </button>
          <button
            className="toggle-btn"
            onClick={() => setShowPreview(true)}
            title="Aperçu full-screen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Aperçu</span>
          </button>

          {/* Devant/Dos — mobile seulement, produits recto/verso */}
          {isTwoSided && (
            <button
              className={`toggle-btn md:hidden ${activeSide === 'front' ? 'active' : ''}`}
              onClick={() => setActiveSide('front')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Devant</span>
            </button>
          )}
          {isTwoSided && (
            <button
              className={`toggle-btn md:hidden ${activeSide === 'back' ? 'active' : ''}`}
              onClick={() => setActiveSide('back')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              <span>Dos</span>
            </button>
          )}

          {/* Couleur — mobile seulement */}
          <button
            className={`toggle-btn md:hidden ${activeToolSection === 'color' ? 'active' : ''}`}
            onClick={() => setActiveToolSection(activeToolSection === 'color' ? null : 'color')}
          >
            <div className="w-6 h-6 rounded-full border-2 border-white/40" style={{ backgroundColor: tshirtColor }} />
            <span>Couleur</span>
          </button>

          {/* Commander — mobile seulement */}
          <button
            className="toggle-btn md:hidden"
            onClick={() => setActiveToolSection('size-quantity')}
            style={{ color: '#00D2FF' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Commander</span>
          </button>

          <div className="flex-1"></div>

          <button
            className="toggle-btn"
            onClick={() => {
              const canvas = activeSide === 'front' ? frontCanvas : (isTwoSided ? backCanvas : frontCanvas);
              canvas?.undo();
            }}
            title="Annuler (Ctrl+Z)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Retour</span>
          </button>
          <button
            className="toggle-btn"
            onClick={() => {
              const canvas = activeSide === 'front' ? frontCanvas : (isTwoSided ? backCanvas : frontCanvas);
              canvas?.redo();
            }}
            title="Rétablir (Ctrl+Y)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            <span>Refaire</span>
          </button>
        </div>

        {/* Div SVG T-Shirt - Centre avec canvas */}
        <div className="editor-svg-tshirt">
          <div className="tshirt-container" style={{ position: 'relative' }}>
            {/* Canvas Devant */}
            <div style={{
              position: isTwoSided ? 'absolute' : 'relative',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: activeSide === 'front' ? 2 : 1,
              pointerEvents: activeSide === 'front' ? 'auto' : 'none',
              opacity: activeSide === 'front' ? 1 : 0,
            }}>
              <DesignCanvas
                side="front"
                mockupUrl={product.mockupFrontUrl}
                onCanvasReady={setFrontCanvas}
                tshirtColor={tshirtColor}
                showGrid={showGrid}
              />
            </div>

            {/* Canvas Dos (uniquement pour les produits recto/verso) */}
            {isTwoSided && (
              <div style={{
                position: 'relative',
                zIndex: activeSide === 'back' ? 2 : 1,
                pointerEvents: activeSide === 'back' ? 'auto' : 'none',
                opacity: activeSide === 'back' ? 1 : 0,
              }}>
                <DesignCanvas
                  side="back"
                  mockupUrl={product.mockupBackUrl}
                  onCanvasReady={setBackCanvas}
                  tshirtColor={tshirtColor}
                  showGrid={showGrid}
                />
              </div>
            )}
          </div>

          {/* Onglets en bas (uniquement si recto/verso) */}
          {isTwoSided && (
            <div className="tshirt-tabs">
              <button
                className={`tshirt-tab ${activeSide === 'front' ? 'active' : ''}`}
                onClick={() => setActiveSide('front')}
              >
                <div className="tab-preview">
                  <img
                    src={`https://image.spreadshirtmedia.net/image-server/v1/productTypes/812/views/1/appearances/${tshirtColor === '#FFFFFF' ? '1' : '2'},width=178,height=178`}
                    alt="Devant"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span>Devant</span>
              </button>
              <button
                className={`tshirt-tab ${activeSide === 'back' ? 'active' : ''}`}
                onClick={() => setActiveSide('back')}
              >
                <div className="tab-preview">
                  <img
                    src={`https://image.spreadshirtmedia.net/image-server/v1/productTypes/812/views/2/appearances/${tshirtColor === '#FFFFFF' ? '1' : '2'},width=178,height=178`}
                    alt="Dos"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span>Dos</span>
              </button>
            </div>
          )}
        </div>

        {/* Bouton supprimer flottant — visible sur mobile quand un objet est sélectionné et drawer fermé */}
        {selectedObject && !activeToolSection && (
          <button
            onClick={handleDeleteSelected}
            className="md:hidden fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-full shadow-lg text-sm font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        )}

        {/* Backdrop mobile pour fermer le drawer */}
        {activeToolSection && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setActiveToolSection(null)}
          />
        )}

        {/* Div Panel - Panneau de droite */}
        <div className={`editor-panel-right${activeToolSection ? ' mobile-drawer-active' : ' mobile-drawer-hidden'}`}>
          <RightPanel
            canvas={activeSide === 'front' || !isTwoSided ? frontCanvas : backCanvas}
            product={product}
            tshirtColor={tshirtColor}
            setTshirtColor={setTshirtColor}
            onSave={handleSaveDesign}
            onOrder={handleOrderDesign}
            saving={saving}
            activeToolSection={activeToolSection}
            setActiveToolSection={setActiveToolSection}
            designId={searchParams.get('designId')}
          />
        </div>
      </div>

      {/* Modal Aperçu full-screen */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">
                {activeSide === 'front' ? 'Devant' : 'Dos'} — {product?.name}
              </span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Fermer
              </button>
            </div>
            {/* Image */}
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Aperçu du design"
                className="w-full rounded-2xl shadow-2xl border border-white/10"
              />
            ) : (
              <div className="w-full aspect-[5/6] bg-white/5 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
              </div>
            )}
            <p className="text-center text-white/40 text-sm mt-4">Cliquez en dehors pour fermer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
