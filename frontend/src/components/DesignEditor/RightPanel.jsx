import { useState, useEffect } from 'react';
import * as fabric from 'fabric';

const RightPanel = ({ canvas, product, tshirtColor, setTshirtColor, onSave, saving, activeToolSection, setActiveToolSection }) => {
  const [textValue, setTextValue] = useState('Votre texte');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [selectedObject, setSelectedObject] = useState(null);
  const [curveValue, setCurveValue] = useState(0);

  const colors = [
    '#FFFFFF', '#F5F5DC', '#000000', '#2F4F4F',
    '#1E3A8A', '#064E3B', '#15803D', '#A3E635',
    '#F87171', '#DC2626'
  ];

  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject(active);

      if (active && active.type === 'i-text') {
        setTextValue(active.text);
        setTextColor(active.fill);
        setFontSize(Math.round(active.fontSize));
        setFontFamily(active.fontFamily);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas]);

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
    if (!canvas) return;

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.set({
          left: 200,
          top: 250,
          scaleX: 0.5,
          scaleY: 0.5,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

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
              <label className="text-sm font-medium block mb-2">Couleur</label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => changeTextColor(color)}
                    className={`w-full h-10 rounded-full border-2 ${
                      textColor === color ? 'border-black ring-2 ring-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

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
        <div className="p-4">
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
            <h3 className="text-sm font-semibold mb-3">Couleur du produit: {tshirtColor === '#FFFFFF' ? 'blanc' : 'noir'}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setTshirtColor('#FFFFFF')}
                className={`color-option ${tshirtColor === '#FFFFFF' ? 'selected' : ''}`}
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
              />
              <button
                onClick={() => setTshirtColor('#000000')}
                className={`color-option ${tshirtColor === '#000000' ? 'selected' : ''}`}
                style={{ backgroundColor: '#000000' }}
              />
            </div>
          </div>

          {/* Size & Quantity Button */}
          <button
            className="size-quantity-btn"
            onClick={() => setActiveToolSection(null)}
          >
            Choisir la quantité & taille
          </button>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
