import { useState } from 'react';
import * as fabric from 'fabric';

const Toolbar = ({ canvas, activeSide }) => {
  const [textValue, setTextValue] = useState('Votre texte');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);

  // Ajouter du texte au canvas
  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText(textValue, {
      left: 250,
      top: 300,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Arial',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Upload et ajouter une image
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

  // Supprimer l'élément sélectionné
  const deleteSelected = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  // Changer la couleur de l'élément sélectionné (texte)
  const changeTextColor = (color) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fill', color);
      canvas.renderAll();
    }
    setTextColor(color);
  };

  // Changer la taille du texte sélectionné
  const changeFontSize = (size) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontSize', parseInt(size));
      canvas.renderAll();
    }
    setFontSize(size);
  };

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#FFA500'
  ];

  return (
    <div className="h-full">
      {/* Section Ajouter des éléments */}
      <div className="toolbar-section">
        <h3>Ajouter</h3>
        <button onClick={addText} className="toolbar-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Ajouter du texte
        </button>
        <label htmlFor="image-upload" className="toolbar-button cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Designs
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Section Texte */}
      <div className="toolbar-section">
        <h3>Texte</h3>
        <div className="property-group">
          <label className="property-label">Contenu du texte</label>
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Votre texte"
            className="property-input"
          />
        </div>

        <div className="property-group">
          <label className="property-label">Taille : {fontSize}px</label>
          <input
            type="range"
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
            min="10"
            max="200"
            className="property-slider"
          />
        </div>

        <div className="property-group">
          <label className="property-label">Couleur du texte</label>
          <div className="color-grid">
            {colors.map((color) => (
              <div
                key={color}
                onClick={() => changeTextColor(color)}
                className={`color-swatch ${textColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={textColor}
            onChange={(e) => changeTextColor(e.target.value)}
            className="w-full h-10 mt-2 border-2 border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Section Actions */}
      <div className="toolbar-section">
        <h3>Actions</h3>
        <button onClick={deleteSelected} className="toolbar-button bg-red-50 hover:bg-red-100 text-red-600 border-red-300 hover:border-red-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>

      {/* Astuce */}
      <div className="toolbar-section bg-blue-50">
        <p className="text-xs text-blue-800 leading-relaxed">
          💡 <strong>Astuce:</strong> Double-cliquez sur le texte pour le modifier directement sur le canvas
        </p>
      </div>
    </div>
  );
};

export default Toolbar;