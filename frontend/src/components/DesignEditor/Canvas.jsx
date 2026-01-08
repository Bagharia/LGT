import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const DesignCanvas = ({ side, onCanvasReady, tshirtColor }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    // Initialiser Fabric.js Canvas avec fond transparent
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: null, // Transparent pour voir le SVG derrière
    });

    fabricCanvasRef.current = canvas;

    // Définir les limites de la zone imprimable (correspond au rectangle en pointillés du SVG)
    const printAreaBounds = {
      left: 130,
      top: 80,
      width: 240,
      height: 320,
    };

    // Ajouter une zone de design (rectangle pour délimiter la zone imprimable)
    const printArea = new fabric.Rect({
      ...printAreaBounds,
      fill: 'transparent',
      stroke: '#ddd',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(printArea);

    // Contraindre les objets à rester dans la zone imprimable
    canvas.on('object:moving', function(e) {
      const obj = e.target;
      const bounds = printAreaBounds;

      // Empêcher l'objet de sortir à gauche
      if (obj.left < bounds.left) {
        obj.left = bounds.left;
      }
      // Empêcher l'objet de sortir en haut
      if (obj.top < bounds.top) {
        obj.top = bounds.top;
      }
      // Empêcher l'objet de sortir à droite
      if (obj.left + obj.getScaledWidth() > bounds.left + bounds.width) {
        obj.left = bounds.left + bounds.width - obj.getScaledWidth();
      }
      // Empêcher l'objet de sortir en bas
      if (obj.top + obj.getScaledHeight() > bounds.top + bounds.height) {
        obj.top = bounds.top + bounds.height - obj.getScaledHeight();
      }
    });

    // Contraindre aussi lors du scaling
    canvas.on('object:scaling', function(e) {
      const obj = e.target;
      const bounds = printAreaBounds;

      // Empêcher l'objet de devenir trop grand pour la zone
      if (obj.getScaledWidth() > bounds.width) {
        obj.scaleX = bounds.width / obj.width;
      }
      if (obj.getScaledHeight() > bounds.height) {
        obj.scaleY = bounds.height / obj.height;
      }

      // Empêcher l'objet de sortir pendant le scaling
      if (obj.left < bounds.left) {
        obj.left = bounds.left;
      }
      if (obj.top < bounds.top) {
        obj.top = bounds.top;
      }
      if (obj.left + obj.getScaledWidth() > bounds.left + bounds.width) {
        obj.left = bounds.left + bounds.width - obj.getScaledWidth();
      }
      if (obj.top + obj.getScaledHeight() > bounds.top + bounds.height) {
        obj.top = bounds.top + bounds.height - obj.getScaledHeight();
      }
    });

    // Contraindre lors de la modification (changement de fontSize, etc.)
    canvas.on('object:modified', function(e) {
      const obj = e.target;
      const bounds = printAreaBounds;

      // Vérifier si l'objet dépasse après modification
      if (obj.getScaledWidth() > bounds.width) {
        const scale = bounds.width / obj.getScaledWidth();
        obj.scaleX *= scale;
        obj.scaleY *= scale;
      }
      if (obj.getScaledHeight() > bounds.height) {
        const scale = bounds.height / obj.getScaledHeight();
        obj.scaleX *= scale;
        obj.scaleY *= scale;
      }

      // Repositionner si l'objet sort de la zone
      if (obj.left < bounds.left) {
        obj.left = bounds.left;
      }
      if (obj.top < bounds.top) {
        obj.top = bounds.top;
      }
      if (obj.left + obj.getScaledWidth() > bounds.left + bounds.width) {
        obj.left = bounds.left + bounds.width - obj.getScaledWidth();
      }
      if (obj.top + obj.getScaledHeight() > bounds.top + bounds.height) {
        obj.top = bounds.top + bounds.height - obj.getScaledHeight();
      }

      canvas.renderAll();
    });

    // Notifier le parent que le canvas est prêt
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, [side]);

  // Déterminer l'apparence selon la couleur du t-shirt
  // appearance 1 = blanc, appearance 2 = noir
  const appearance = tshirtColor === '#FFFFFF' || tshirtColor === 'white' ? '1' : '2';

  // Déterminer l'URL de l'image selon le côté et la couleur
  const viewNumber = side === 'front' ? '1' : '2';
  const tshirtImageUrl = `https://image.spreadshirtmedia.net/image-server/v1/productTypes/812/views/${viewNumber}/appearances/${appearance},width=800,height=800`;

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="relative">
        {/* SVG T-Shirt en arrière-plan */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 0 }}>
          <svg
            width="500"
            height="600"
            viewBox="0 0 500 600"
            className="pointer-events-none"
          >
            {/* Image du t-shirt Spreadshirt */}
            <image
              href={tshirtImageUrl}
              x="0"
              y="-50"
              width="500"
              height="600"
            />

            {/* Zone imprimable (rectangle en pointillés) */}
            <rect
              x="130"
              y="80"
              width="240"
              height="320"
              fill="none"
              stroke="#999999"
              strokeWidth="2"
              strokeDasharray="10 5"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Canvas Fabric.js par-dessus */}
        <div className="relative" style={{ zIndex: 10 }}>
          <canvas ref={canvasRef} id={`canvas-${side}`} />
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;