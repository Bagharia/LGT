import { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { CANVAS_CONFIG } from './Canvas';
import { useAuth } from '../../context/AuthContext';

const { PX_PER_CM, PRINT_AREA } = CANVAS_CONFIG;

const RightPanel = ({ canvas, product, tshirtColor, setTshirtColor, onSave, onOrder, saving, activeToolSection, setActiveToolSection, designId }) => {
  const { isPro } = useAuth();
  const [textValue, setTextValue] = useState('Votre texte');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [selectedObject, setSelectedObject] = useState(null);
  const [curveValue, setCurveValue] = useState(0);

  // États pour les dimensions de l'objet sélectionné (en cm)
  const [objectWidthCm, setObjectWidthCm] = useState(0);
  const [objectHeightCm, setObjectHeightCm] = useState(0);
  const [objectLeftCm, setObjectLeftCm] = useState(0);
  const [objectTopCm, setObjectTopCm] = useState(0);

  // Zone imprimable (importée de Canvas)
  const printAreaBounds = PRINT_AREA;

  // Conversion px <-> cm
  const pxToCm = (px) => (px / PX_PER_CM).toFixed(1);
  const cmToPx = (cm) => parseFloat(cm) * PX_PER_CM;

  // États pour les tailles et quantités
  const [quantities, setQuantities] = useState({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  const colors = [
    '#FFFFFF', '#F5F5DC', '#000000', '#2F4F4F',
    '#1E3A8A', '#064E3B', '#15803D', '#A3E635',
    '#F87171', '#DC2626'
  ];

  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  // Mettre à jour les dimensions affichées (en cm)
  const updateObjectDimensions = (obj) => {
    if (!obj) return;
    const bounds = obj.getBoundingRect();
    // Convertir les dimensions en cm
    setObjectWidthCm(pxToCm(bounds.width));
    setObjectHeightCm(pxToCm(bounds.height));
    // Position relative à la zone imprimable, convertie en cm
    setObjectLeftCm(pxToCm(obj.left - printAreaBounds.left));
    setObjectTopCm(pxToCm(obj.top - printAreaBounds.top));
  };

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject(active);

      if (active) {
        updateObjectDimensions(active);

        if (active.type === 'i-text') {
          setTextValue(active.text);
          setTextColor(active.fill);
          setFontSize(Math.round(active.fontSize));
          setFontFamily(active.fontFamily);
        }
      }
    };

    const handleObjectModified = (e) => {
      if (e.target) {
        updateObjectDimensions(e.target);
      }
    };

    const handleObjectScaling = (e) => {
      if (e.target) {
        updateObjectDimensions(e.target);
      }
    };

    const handleObjectMoving = (e) => {
      if (e.target) {
        setObjectLeftCm(pxToCm(e.target.left - printAreaBounds.left));
        setObjectTopCm(pxToCm(e.target.top - printAreaBounds.top));
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObject(null));
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:moving', handleObjectMoving);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:scaling', handleObjectScaling);
      canvas.off('object:moving', handleObjectMoving);
    };
  }, [canvas]);

  // Modifier la largeur de l'objet (en cm)
  const changeObjectWidth = (value) => {
    setObjectWidthCm(value);

    if (!canvas || !selectedObject) return;
    const newWidthCm = parseFloat(value);
    if (isNaN(newWidthCm) || newWidthCm < 0.1) return;

    const newWidthPx = cmToPx(newWidthCm);
    const currentBounds = selectedObject.getBoundingRect();
    if (currentBounds.width === 0) return;
    const scale = newWidthPx / currentBounds.width;
    selectedObject.set('scaleX', selectedObject.scaleX * scale);
    selectedObject.setCoords();
    canvas.renderAll();
  };

  // Modifier la hauteur de l'objet (en cm)
  const changeObjectHeight = (value) => {
    setObjectHeightCm(value);

    if (!canvas || !selectedObject) return;
    const newHeightCm = parseFloat(value);
    if (isNaN(newHeightCm) || newHeightCm < 0.1) return;

    const newHeightPx = cmToPx(newHeightCm);
    const currentBounds = selectedObject.getBoundingRect();
    if (currentBounds.height === 0) return;
    const scale = newHeightPx / currentBounds.height;
    selectedObject.set('scaleY', selectedObject.scaleY * scale);
    selectedObject.setCoords();
    canvas.renderAll();
  };

  // Modifier la position X (en cm, relative à la zone imprimable)
  const changeObjectLeft = (value) => {
    setObjectLeftCm(value);

    if (!canvas || !selectedObject) return;
    const newLeftCm = parseFloat(value);
    if (isNaN(newLeftCm)) return;

    const newLeftPx = printAreaBounds.left + cmToPx(newLeftCm);
    selectedObject.set('left', newLeftPx);
    selectedObject.setCoords();
    canvas.renderAll();
  };

  // Modifier la position Y (en cm, relative à la zone imprimable)
  const changeObjectTop = (value) => {
    setObjectTopCm(value);

    if (!canvas || !selectedObject) return;
    const newTopCm = parseFloat(value);
    if (isNaN(newTopCm)) return;

    const newTopPx = printAreaBounds.top + cmToPx(newTopCm);
    selectedObject.set('top', newTopPx);
    selectedObject.setCoords();
    canvas.renderAll();
  };

  // Ajouter du texte au canvas
  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText(textValue, {
      left: 250,
      top: 300,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: fontFamily,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Modifier le texte sélectionné
  const updateSelectedText = (property, value) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set(property, value);
      canvas.fire('object:modified', { target: activeObject });
      canvas.renderAll();
    }
  };

  // Changer le contenu du texte
  const changeTextValue = (value) => {
    setTextValue(value);
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('text', value);
      canvas.renderAll();
    }
  };

  // Changer la couleur du texte
  const changeTextColor = (color) => {
    setTextColor(color);
    updateSelectedText('fill', color);
  };

  // Changer la taille
  const changeFontSize = (size) => {
    const newSize = parseInt(size);
    // Limiter la taille max à 150px pour éviter de dépasser la zone imprimable
    const clampedSize = Math.min(Math.max(newSize, 10), 150);
    setFontSize(clampedSize);
    updateSelectedText('fontSize', clampedSize);
  };

  // Incrémenter/décrémenter la taille
  const incrementFontSize = (increment) => {
    const newSize = fontSize + increment;
    if (newSize >= 10 && newSize <= 150) {
      changeFontSize(newSize);
    }
  };

  // Changer la police
  const changeFontFamily = (font) => {
    setFontFamily(font);
    updateSelectedText('fontFamily', font);
  };

  // Aligner le texte
  const alignText = (alignment) => {
    updateSelectedText('textAlign', alignment);
  };

  // Mettre en gras
  const toggleBold = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      const currentWeight = activeObject.fontWeight;
      activeObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
      canvas.renderAll();
    }
  };

  // Mettre en italique
  const toggleItalic = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      const currentStyle = activeObject.fontStyle;
      activeObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
      canvas.renderAll();
    }
  };

  // Mettre souligné
  const toggleUnderline = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('underline', !activeObject.underline);
      canvas.renderAll();
    }
  };

  // Courber le texte - Créer un véritable effet d'arc
  const curveText = (value) => {
    const newCurveValue = parseInt(value);
    setCurveValue(newCurveValue);

    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'i-text') return;

    // Réinitialiser si la courbure est à 0
    if (newCurveValue === 0) {
      // Supprimer les effets personnalisés
      activeObject.set({
        charSpacing: 0,
        skewX: 0,
        skewY: 0,
      });
      // Supprimer le path effect si présent
      delete activeObject.path;
      canvas.renderAll();
      return;
    }

    // Simuler l'effet d'arc avec charSpacing et skew
    // Plus la valeur est élevée, plus l'espacement et la déformation sont importants
    const charSpacing = Math.abs(newCurveValue) * 2; // Espacement entre caractères
    const skewY = (newCurveValue / 100) * 20; // Déformation verticale

    // Appliquer l'espacement et la déformation
    activeObject.set({
      charSpacing: charSpacing,
      skewY: skewY,
    });

    canvas.renderAll();
  };

  // Mettre à l'avant
  const bringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
  };

  // Mettre à l'arrière
  const sendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
  };

  // Dupliquer
  const duplicateObject = () => {
    if (!canvas || !selectedObject) return;

    selectedObject.clone((cloned) => {
      cloned.set({
        left: selectedObject.left + 10,
        top: selectedObject.top + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  // Supprimer
  const deleteObject = () => {
    if (!canvas || !selectedObject) return;

    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  // Upload image
  const handleImageUpload = (e) => {
    if (!canvas) {
      console.error('Canvas not ready');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const img = await fabric.FabricImage.fromURL(event.target.result, {
          crossOrigin: 'anonymous'
        });

        // Centrer l'image dans la zone imprimable
        const printAreaBounds = {
          left: 130,
          top: 80,
          width: 240,
          height: 320,
        };

        // Calculer l'échelle pour que l'image tienne dans la zone
        const maxWidth = printAreaBounds.width;
        const maxHeight = printAreaBounds.height;
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1) * 0.5; // 50% de la taille max

        // Calculer la position pour centrer l'image (avec originX/Y par défaut = left/top)
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const centerLeft = printAreaBounds.left + (printAreaBounds.width - scaledWidth) / 2;
        const centerTop = printAreaBounds.top + (printAreaBounds.height - scaledHeight) / 2;

        img.set({
          left: centerLeft,
          top: centerTop,
          scaleX: scale,
          scaleY: scale,
          lockScalingFlip: true, // Empêcher le flip lors du scaling
          lockUniScaling: false, // Permettre le scaling uniforme
        });

        // Forcer le redimensionnement proportionnel uniquement
        img.setControlsVisibility({
          mt: false, // Pas de contrôle en haut
          mb: false, // Pas de contrôle en bas
          ml: false, // Pas de contrôle à gauche
          mr: false, // Pas de contrôle à droite
          // Garder seulement les coins pour un redimensionnement proportionnel
          tl: true,  // Coin haut-gauche
          tr: true,  // Coin haut-droit
          bl: true,  // Coin bas-gauche
          br: true,  // Coin bas-droit
          mtr: true, // Contrôle de rotation
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsDataURL(file);
  };

  // Gérer les changements de quantité
  const updateQuantity = (size, delta) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, prev[size] + delta)
    }));
  };

  // Gérer la saisie directe de la quantité
  const handleQuantityInput = (size, value) => {
    const num = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, num)
    }));
  };

  // Calculer le total d'articles et prix
  const totalArticles = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const pricePerItem = product?.basePrice || 0.01;
  const totalPrice = totalArticles * pricePerItem;

  // Appliquer réduction si >= 6 articles
  const discount = totalArticles >= 6 ? 0.10 : 0;
  const finalPrice = totalPrice * (1 - discount);

  // Validation pro : minimum 20 articles
  const isProAccount = isPro();
  const proMinArticles = 20;
  const proCanOrder = !isProAccount || totalArticles >= proMinArticles;

  return (
    <div className="spreadshirt-right-panel">
      {/* Top Action Bar
      <div className="top-action-bar">
        <button className="action-icon-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Assistance</span>
        </button>
        <button className="action-icon-btn" onClick={onSave} disabled={saving}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
        </button>
        <button className="action-icon-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Partager</span>
        </button>
        <button className="action-icon-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>Plein écran</span>
        </button>
      </div> */}

      {/* Text Editor Section - Shown when activeToolSection === 'text' */}
      {activeToolSection === 'text' && (
        <div className="overflow-y-auto flex-1">
          {/* Preview Text */}
          <div className="p-4 border-b border-gray-200">
            <div className="border-2 border-cyan-500 rounded-lg p-6 bg-white min-h-[100px] flex items-center justify-center">
              <span style={{ fontSize: '24px', color: textColor, fontFamily: fontFamily }}>
                {textValue || 'Votre texte'}
              </span>
            </div>
          </div>

          {/* Text Controls */}
          <div className="p-4 space-y-4">
            {/* Text Input */}
            <div>
              <input
                type="text"
                value={textValue}
                onChange={(e) => changeTextValue(e.target.value)}
                placeholder="Votre texte"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Color and Font Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-cyan-500">
                <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: textColor }}></div>
              </button>
              <button onClick={toggleBold} className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-cyan-500 font-bold">
                B
              </button>
              <button onClick={toggleItalic} className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-cyan-500 italic">
                I
              </button>
              <button onClick={toggleUnderline} className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-cyan-500 underline">
                U
              </button>
            </div>

            {/* Alignment Buttons */}
            <div className="flex gap-2">
              <button onClick={() => alignText('left')} className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-cyan-500">
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
              <button onClick={() => alignText('center')} className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-cyan-500">
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                </svg>
              </button>
              <button onClick={() => alignText('right')} className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-cyan-500">
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                </svg>
              </button>
              <button onClick={() => alignText('justify')} className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-cyan-500">
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Taille de la police</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => incrementFontSize(-10)} className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">-</button>
                  <span className="w-12 text-center font-medium">{fontSize}</span>
                  <button onClick={() => incrementFontSize(10)} className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">+</button>
                </div>
              </div>
              <input
                type="range"
                value={fontSize}
                onChange={(e) => changeFontSize(e.target.value)}
                min="10"
                max="150"
                className="w-full"
              />
            </div>

            {/* Curve Text */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Courber le texte</label>
                <span className="text-sm text-gray-600">{curveValue}</span>
              </div>
              <input
                type="range"
                value={curveValue}
                onChange={(e) => curveText(e.target.value)}
                min="-100"
                max="100"
                className="w-full"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-sm font-medium block mb-3">Couleur</label>

              {/* Palette de couleurs prédéfinies */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {/* Première ligne */}
                <button
                  onClick={() => changeTextColor('#FFFFFF')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#FFFFFF' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#FFFFFF' }}
                  title="Blanc"
                />
                <button
                  onClick={() => changeTextColor('#000000')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#000000' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#000000' }}
                  title="Noir"
                />
                <button
                  onClick={() => changeTextColor('#1E3A8A')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#1E3A8A' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#1E3A8A' }}
                  title="Bleu marine"
                />
                <button
                  onClick={() => changeTextColor('#0EA5E9')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#0EA5E9' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#0EA5E9' }}
                  title="Bleu ciel"
                />
                <button
                  onClick={() => changeTextColor('#EAB308')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#EAB308' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#EAB308' }}
                  title="Jaune"
                />
                <button
                  onClick={() => changeTextColor('#F59E0B')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#F59E0B' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#F59E0B' }}
                  title="Orange"
                />
                <button
                  onClick={() => changeTextColor('#DC2626')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#DC2626' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#DC2626' }}
                  title="Rouge"
                />

                {/* Deuxième ligne */}
                <button
                  onClick={() => changeTextColor('#059669')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#059669' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#059669' }}
                  title="Vert émeraude"
                />
                <button
                  onClick={() => changeTextColor('#1E40AF')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#1E40AF' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#1E40AF' }}
                  title="Bleu foncé"
                />
                <button
                  onClick={() => changeTextColor('#EA580C')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#EA580C' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#EA580C' }}
                  title="Orange foncé"
                />
                <button
                  onClick={() => changeTextColor('#BE185D')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#BE185D' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#BE185D' }}
                  title="Rose foncé"
                />
                <button
                  onClick={() => changeTextColor('#78350F')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#78350F' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#78350F' }}
                  title="Marron"
                />
                <button
                  onClick={() => changeTextColor('#6B21A8')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#6B21A8' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#6B21A8' }}
                  title="Violet"
                />
                <button
                  onClick={() => changeTextColor('#0E7490')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#0E7490' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#0E7490' }}
                  title="Cyan foncé"
                />

                {/* Troisième ligne */}
                <button
                  onClick={() => changeTextColor('#7C2D12')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#7C2D12' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#7C2D12' }}
                  title="Marron foncé"
                />
                <button
                  onClick={() => changeTextColor('#F5F5DC')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#F5F5DC' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#F5F5DC' }}
                  title="Beige"
                />
                <button
                  onClick={() => changeTextColor('#FCA5A5')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#FCA5A5' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#FCA5A5' }}
                  title="Rose clair"
                />
                <button
                  onClick={() => changeTextColor('#BAE6FD')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#BAE6FD' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#BAE6FD' }}
                  title="Bleu clair"
                />
                <button
                  onClick={() => changeTextColor('#DDD6FE')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#DDD6FE' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#DDD6FE' }}
                  title="Violet clair"
                />
                <button
                  onClick={() => changeTextColor('#BEF264')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#BEF264' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#BEF264' }}
                  title="Vert citron"
                />
                <button
                  onClick={() => changeTextColor('#6B7280')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#6B7280' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#6B7280' }}
                  title="Gris"
                />

                {/* Quatrième ligne */}
                <button
                  onClick={() => changeTextColor('#92400E')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#92400E' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#92400E' }}
                  title="Brun"
                />
                <button
                  onClick={() => changeTextColor('#84CC16')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#84CC16' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#84CC16' }}
                  title="Vert lime"
                />
                <button
                  onClick={() => changeTextColor('#EC4899')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#EC4899' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#EC4899' }}
                  title="Rose"
                />
                <button
                  onClick={() => changeTextColor('#8B5CF6')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#8B5CF6' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#8B5CF6' }}
                  title="Violet moyen"
                />
                <button
                  onClick={() => changeTextColor('#06B6D4')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#06B6D4' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#06B6D4' }}
                  title="Cyan"
                />
                <button
                  onClick={() => changeTextColor('#10B981')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#10B981' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#10B981' }}
                  title="Vert"
                />
                <button
                  onClick={() => changeTextColor('#F97316')}
                  className={`w-10 h-10 rounded-full border-2 ${textColor === '#F97316' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#F97316' }}
                  title="Orange vif"
                />
              </div>

              {/* Sélecteur de couleur personnalisé */}
              <div className="mt-2">
                <label className="text-xs text-gray-600 mb-2 block">Couleur personnalisée:</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => changeTextColor(e.target.value)}
                  className="w-full h-10 rounded border-2 border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Dimensions Panel - Shown when object is selected */}
            {selectedObject && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Dimensions & Position (cm)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Largeur (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={objectWidthCm}
                      onChange={(e) => changeObjectWidth(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                      min="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Hauteur (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={objectHeightCm}
                      onChange={(e) => changeObjectHeight(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                      min="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Position X (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={objectLeftCm}
                      onChange={(e) => changeObjectLeft(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Position Y (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={objectTopCm}
                      onChange={(e) => changeObjectTop(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              <button onClick={bringToFront} className="flex flex-col items-center gap-1 py-3 hover:bg-gray-100 rounded-lg" disabled={!selectedObject}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-xs">À l'avant</span>
              </button>
              <button onClick={sendToBack} className="flex flex-col items-center gap-1 py-3 hover:bg-gray-100 rounded-lg" disabled={!selectedObject}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4m-6 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="text-xs">À l'arrière</span>
              </button>
              <button onClick={duplicateObject} className="flex flex-col items-center gap-1 py-3 hover:bg-gray-100 rounded-lg" disabled={!selectedObject}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Dupliquer</span>
              </button>
              <button onClick={deleteObject} className="flex flex-col items-center gap-1 py-3 hover:bg-red-50 text-red-600 rounded-lg" disabled={!selectedObject}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-xs">Supprimer</span>
              </button>
            </div>

            {/* Add Text Button */}
            {!selectedObject && (
              <button onClick={addText} className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600">
                Ajouter du texte
              </button>
            )}
          </div>
        </div>
      )}

      {/* Designs Section */}
      {activeToolSection === 'designs' && (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold mb-4">Vos designs</h3>
          <label htmlFor="image-upload" className="block w-full py-12 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-cyan-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-600">Cliquez pour importer une image</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Dimensions Panel for images */}
          {selectedObject && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">Dimensions & Position (cm)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Largeur (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={objectWidthCm}
                    onChange={(e) => changeObjectWidth(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                    min="0.1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Hauteur (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={objectHeightCm}
                    onChange={(e) => changeObjectHeight(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                    min="0.1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Position X (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={objectLeftCm}
                    onChange={(e) => changeObjectLeft(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Position Y (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={objectTopCm}
                    onChange={(e) => changeObjectTop(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Action buttons for images */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button onClick={bringToFront} className="flex flex-col items-center gap-1 py-3 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span className="text-xs">À l'avant</span>
                </button>
                <button onClick={sendToBack} className="flex flex-col items-center gap-1 py-3 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4m-6 4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  <span className="text-xs">À l'arrière</span>
                </button>
                <button onClick={deleteObject} className="flex flex-col items-center gap-1 py-3 hover:bg-red-50 text-red-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs">Supprimer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Info - Always visible at bottom */}
      {!activeToolSection && (
        <div className="p-6 space-y-6">
          {/* Product Details */}
          <div>
            <div className="product-badge">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Bio
            </div>
            <h2 className="text-2xl font-bold mb-2 mt-2">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-3">Livraison: 16 - 19 janv.</p>
            <button className="product-link">Voir les détails du produit →</button>
          </div>

          {/* Print Method */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3">Procédé d'impression:</h3>
            <div className="inline-block px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded">
              Impression Digitale Directe
            </div>
          </div>

          {/* Color Selection */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3">Couleur du produit</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setTshirtColor('#FFFFFF')}
                className={`w-12 h-12 rounded-full border-2 ${tshirtColor === '#FFFFFF' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                style={{ backgroundColor: '#FFFFFF' }}
                title="Blanc"
              />
              <button
                onClick={() => setTshirtColor('#000000')}
                className={`w-12 h-12 rounded-full border-2 ${tshirtColor === '#000000' ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-300'}`}
                style={{ backgroundColor: '#000000' }}
                title="Noir"
              />
            </div>
          </div>

          {/* Size & Quantity Button */}
          <button
            className="size-quantity-btn"
            onClick={() => setActiveToolSection('size-quantity')}
          >
            Choisir la quantité & taille
          </button>
        </div>
      )}

      {/* Size & Quantity Selection Section */}
      {activeToolSection === 'size-quantity' && (
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold mb-6">Choisir la taille</h2>

          {/* Size selection with quantity controls */}
          <div className="space-y-4">
            {Object.keys(quantities).map(size => (
              <div key={size} className="flex items-center justify-between py-3 border-b">
                <span className="font-medium text-lg">{size}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(size, -1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100"
                    disabled={quantities[size] === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quantities[size]}
                    onChange={(e) => handleQuantityInput(size, e.target.value)}
                    className="w-16 text-center text-black font-medium text-lg border-2 border-gray-300 rounded px-2 py-1 "
                  />
                  <button
                    onClick={() => updateQuantity(size, 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price info */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Prix de l'article:</span>
              <span className="font-semibold">{pricePerItem.toFixed(2)} €</span>
            </div>
            {totalArticles >= 6 && (
              <p className="text-sm text-green-600 font-medium">
                Dès 6 articles, 10% de réduction
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              {totalArticles} article{totalArticles > 1 ? 's' : ''} sélectionné{totalArticles > 1 ? 's' : ''}
            </p>
            <div className="text-2xl font-bold mb-4">
              Total: {finalPrice.toFixed(2)} €
            </div>
            <p className="text-xs text-gray-500 mb-4">
              TTC (EU), coûts d'impression inclus, hors frais de port
            </p>
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

          {/* Save & Order buttons */}
          <div className="space-y-3">
            <button
              className="w-full py-3 rounded-lg font-semibold text-lg border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
              onClick={() => onSave()}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : (designId ? 'Sauvegarder' : 'Sauvegarder le design')}
            </button>
            <button
              className={`w-full py-4 rounded-lg font-semibold text-lg ${
                totalArticles > 0 && proCanOrder
                  ? 'bg-cyan-400 hover:bg-cyan-500 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => onOrder(quantities, totalPrice, finalPrice)}
              disabled={totalArticles === 0 || !proCanOrder || saving}
            >
              {saving ? 'Enregistrement...' : 'Commander'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
