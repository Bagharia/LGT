import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, designsAPI, ordersAPI } from '../services/api';
import { useToast } from '../components/Toast';
import DesignCanvas from '../components/DesignEditor/Canvas';
import RightPanel from '../components/DesignEditor/RightPanel';
import * as fabric from 'fabric';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

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

  const isTwoSided = product?.category?.hasTwoSides ?? true;

  // Ajouter du texte automatiquement quand on clique sur le bouton Texte
  const handleTextClick = () => {
    setActiveToolSection('text');

    // Ajouter du texte au canvas actif
    const canvas = activeSide === 'front' ? frontCanvas : (isTwoSided ? backCanvas : frontCanvas);
    if (canvas) {
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
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

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

      const designId = searchParams.get('designId');

      let finalDesignId;

      if (designId) {
        await designsAPI.update(designId, {
          frontDesignJson: frontJson,
          backDesignJson: backJson,
          frontPreviewUrl: frontPreview,
          backPreviewUrl: backPreview,
          name: `Design ${new Date().toLocaleDateString()}`,
          quantities: quantities,
          totalPrice: totalPrice,
          finalPrice: finalPrice,
          tshirtColor: tshirtColor
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
          quantities: quantities,
          totalPrice: totalPrice,
          finalPrice: finalPrice,
          tshirtColor: tshirtColor
        });
        finalDesignId = savedDesign.design.id;
      }

      // Créer la commande
      const orderResult = await ordersAPI.create({
        designs: [{
          designId: finalDesignId,
          quantities: quantities,
          finalPrice: finalPrice
        }],
        totalPrice: finalPrice
      });

      // Rediriger vers le checkout pour le paiement
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
          <Link to="/" className="font-space-grotesk text-xl font-bold text-white tracking-tight">
            LGT<span className="text-accent">.</span>
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-text-muted text-sm">{product?.name}</span>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            className={`toggle-btn ${activeToolSection === 'designs' ? 'active' : ''}`}
            onClick={() => setActiveToolSection('designs')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Designs</span>
          </button>
          <button className="toggle-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Importer</span>
          </button>
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

          <div className="flex-1"></div>

          <button className="toggle-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Retour</span>
          </button>
          <button className="toggle-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            <span>Refaire</span>
          </button>
        </div>

        {/* Div SVG T-Shirt - Centre avec canvas */}
        <div className="editor-svg-tshirt">
          <div className="tshirt-container">
            {/* Canvas Devant */}
            <div style={{ display: activeSide === 'front' ? 'block' : 'none' }}>
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
              <div style={{ display: activeSide === 'back' ? 'block' : 'none' }}>
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

        {/* Div Panel - Panneau de droite */}
        <div className="editor-panel-right">
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
    </div>
  );
};

export default Editor;
