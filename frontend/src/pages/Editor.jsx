import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, designsAPI } from '../services/api';
import DesignCanvas from '../components/DesignEditor/Canvas';
import RightPanel from '../components/DesignEditor/RightPanel';
import * as fabric from 'fabric';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
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

  // Ajouter du texte automatiquement quand on clique sur le bouton Texte
  const handleTextClick = () => {
    setActiveToolSection('text');

    // Ajouter du texte au canvas actif
    const canvas = activeSide === 'front' ? frontCanvas : backCanvas;
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
    if (designId && frontCanvas && backCanvas && !designLoaded) {
      loadDesign(designId);
      setDesignLoaded(true);
    }
  }, [searchParams, frontCanvas, backCanvas, designLoaded]); // Ajouter les canvas pour déclencher le chargement quand ils sont prêts

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
      alert('Erreur lors du chargement du design');
    }
  };

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

  const handleSaveDesign = async (quantities, totalPrice, finalPrice) => {
    if (!frontCanvas) {
      alert('Aucun design à sauvegarder');
      return;
    }

    try {
      setSaving(true);

      const frontJson = JSON.stringify(frontCanvas.toJSON());
      const backJson = backCanvas ? JSON.stringify(backCanvas.toJSON()) : null;

      const frontPreview = frontCanvas.toDataURL({ format: 'png' });
      const backPreview = backCanvas ? backCanvas.toDataURL({ format: 'png' }) : null;

      await designsAPI.save({
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

      alert('Design sauvegardé avec succès !');
      navigate('/my-designs');

    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde du design');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Produit non trouvé</p>
      </div>
    );
  }

  return (
    <div className="editor-layout">
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
              />
            </div>

            {/* Canvas Dos */}
            <div style={{ display: activeSide === 'back' ? 'block' : 'none' }}>
              <DesignCanvas
                side="back"
                mockupUrl={product.mockupBackUrl}
                onCanvasReady={setBackCanvas}
                tshirtColor={tshirtColor}
              />
            </div>
          </div>

          {/* Onglets en bas */}
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
        </div>

        {/* Div Panel - Panneau de droite */}
        <div className="editor-panel-right">
          <RightPanel
            canvas={activeSide === 'front' ? frontCanvas : backCanvas}
            product={product}
            tshirtColor={tshirtColor}
            setTshirtColor={setTshirtColor}
            onSave={handleSaveDesign}
            saving={saving}
            activeToolSection={activeToolSection}
            setActiveToolSection={setActiveToolSection}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
