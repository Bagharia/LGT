import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';

// Configuration des dimensions réelles
// Zone imprimable réelle du t-shirt : environ 30cm x 40cm
const REAL_WIDTH_CM = 30;
const REAL_HEIGHT_CM = 40;
const PRINT_AREA_PX = { width: 240, height: 320 };

// Calcul du ratio pixels/cm
const PX_PER_CM = PRINT_AREA_PX.width / REAL_WIDTH_CM; // ~8 pixels par cm

// Taille de la grille en cm
const GRID_SIZE_CM = 1;
const GRID_SIZE_PX = GRID_SIZE_CM * PX_PER_CM;

// Zone imprimable
const PRINT_AREA = {
  left: 130,
  top: 80,
  width: 240,
  height: 320,
};

const DesignCanvas = ({ side, onCanvasReady, tshirtColor, showGrid = true, snapToGrid = true }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ cmX: '0.0', cmY: '0.0' });

  // Throttle pour limiter les mises à jour
  const lastUpdate = useRef(0);
  const throttledSetMousePos = useCallback((pos) => {
    const now = Date.now();
    if (now - lastUpdate.current > 50) { // Max 20 updates/sec
      lastUpdate.current = now;
      setMousePos(pos);
    }
  }, []);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: null,
      renderOnAddRemove: false, // Optimisation
    });

    fabricCanvasRef.current = canvas;

    // Zone de design (rectangle cyan en pointillés)
    const printArea = new fabric.Rect({
      ...PRINT_AREA,
      fill: 'transparent',
      stroke: '#00bcd4',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });
    canvas.add(printArea);
    canvas.renderAll();

    // Fonction snap to grid
    const snapToGridValue = (value, origin) => {
      if (!snapToGrid) return value;
      const relativeValue = value - origin;
      const snapped = Math.round(relativeValue / GRID_SIZE_PX) * GRID_SIZE_PX;
      return origin + snapped;
    };

    // Contraindre les objets
    canvas.on('object:moving', function(e) {
      const obj = e.target;
      if (!obj) return;

      // Snap to grid
      if (snapToGrid) {
        obj.left = snapToGridValue(obj.left, PRINT_AREA.left);
        obj.top = snapToGridValue(obj.top, PRINT_AREA.top);
      }

      // Limites
      if (obj.left < PRINT_AREA.left) obj.left = PRINT_AREA.left;
      if (obj.top < PRINT_AREA.top) obj.top = PRINT_AREA.top;
      if (obj.left + obj.getScaledWidth() > PRINT_AREA.left + PRINT_AREA.width) {
        obj.left = PRINT_AREA.left + PRINT_AREA.width - obj.getScaledWidth();
      }
      if (obj.top + obj.getScaledHeight() > PRINT_AREA.top + PRINT_AREA.height) {
        obj.top = PRINT_AREA.top + PRINT_AREA.height - obj.getScaledHeight();
      }
    });

    canvas.on('object:scaling', function(e) {
      const obj = e.target;
      if (!obj) return;

      if (obj.getScaledWidth() > PRINT_AREA.width) {
        obj.scaleX = PRINT_AREA.width / obj.width;
      }
      if (obj.getScaledHeight() > PRINT_AREA.height) {
        obj.scaleY = PRINT_AREA.height / obj.height;
      }

      if (obj.left < PRINT_AREA.left) obj.left = PRINT_AREA.left;
      if (obj.top < PRINT_AREA.top) obj.top = PRINT_AREA.top;
      if (obj.left + obj.getScaledWidth() > PRINT_AREA.left + PRINT_AREA.width) {
        obj.left = PRINT_AREA.left + PRINT_AREA.width - obj.getScaledWidth();
      }
      if (obj.top + obj.getScaledHeight() > PRINT_AREA.top + PRINT_AREA.height) {
        obj.top = PRINT_AREA.top + PRINT_AREA.height - obj.getScaledHeight();
      }
    });

    // Track mouse position (throttled)
    canvas.on('mouse:move', function(e) {
      if (!e.e) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.e.clientX - rect.left;
      const y = e.e.clientY - rect.top;
      const cmX = Math.max(0, (x - PRINT_AREA.left) / PX_PER_CM);
      const cmY = Math.max(0, (y - PRINT_AREA.top) / PX_PER_CM);
      throttledSetMousePos({
        cmX: cmX.toFixed(1),
        cmY: cmY.toFixed(1)
      });
    });

    // Ajouter infos au canvas
    canvas.printAreaBounds = PRINT_AREA;
    canvas.PX_PER_CM = PX_PER_CM;

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    return () => {
      canvas.dispose();
    };
  }, [side, snapToGrid, throttledSetMousePos]);

  // Apparence du t-shirt
  const appearance = tshirtColor === '#FFFFFF' || tshirtColor === 'white' ? '1' : '2';
  const viewNumber = side === 'front' ? '1' : '2';
  const tshirtImageUrl = `https://image.spreadshirtmedia.net/image-server/v1/productTypes/812/views/${viewNumber}/appearances/${appearance},width=800,height=800`;

  // Générer les lignes de grille pour le SVG
  const gridLines = [];
  if (showGrid) {
    // Lignes verticales
    for (let i = 0; i <= REAL_WIDTH_CM; i++) {
      const x = PRINT_AREA.left + (i * GRID_SIZE_PX);
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={PRINT_AREA.top}
          x2={x}
          y2={PRINT_AREA.top + PRINT_AREA.height}
          stroke={i % 5 === 0 ? '#bbb' : '#ddd'}
          strokeWidth={i % 5 === 0 ? 1 : 0.5}
        />
      );
    }
    // Lignes horizontales
    for (let i = 0; i <= REAL_HEIGHT_CM; i++) {
      const y = PRINT_AREA.top + (i * GRID_SIZE_PX);
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={PRINT_AREA.left}
          y1={y}
          x2={PRINT_AREA.left + PRINT_AREA.width}
          y2={y}
          stroke={i % 5 === 0 ? '#bbb' : '#ddd'}
          strokeWidth={i % 5 === 0 ? 1 : 0.5}
        />
      );
    }
  }

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="relative">
        {/* Indicateur de position - masqué avec la grille */}
        {showGrid && (
          <div
            className="absolute bg-cyan-500 text-white text-xs px-2 py-1 rounded shadow font-mono"
            style={{ left: '130px', top: '55px', zIndex: 25 }}
          >
            {mousePos.cmX} × {mousePos.cmY} cm
          </div>
        )}

        {/* SVG avec t-shirt et grille */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 0 }}>
          <svg
            width="500"
            height="600"
            viewBox="0 0 500 600"
            className="pointer-events-none"
          >
            {/* Image du t-shirt */}
            <image
              href={tshirtImageUrl}
              x="0"
              y="-50"
              width="500"
              height="600"
            />

            {/* Grille en SVG (plus performant) */}
            {gridLines}

            {/* Règles (graduations) - masquées avec la grille */}
            {showGrid && (
              <>
                {/* Règle horizontale */}
                <rect x={PRINT_AREA.left} y={PRINT_AREA.top - 18} width={PRINT_AREA.width} height="15" fill="#f3f4f6" />
                {[0, 5, 10, 15, 20, 25, 30].map(cm => (
                  <g key={`rx-${cm}`}>
                    <line
                      x1={PRINT_AREA.left + cm * GRID_SIZE_PX}
                      y1={PRINT_AREA.top - 18}
                      x2={PRINT_AREA.left + cm * GRID_SIZE_PX}
                      y2={PRINT_AREA.top - 8}
                      stroke="#666"
                      strokeWidth="1"
                    />
                    <text
                      x={PRINT_AREA.left + cm * GRID_SIZE_PX + 2}
                      y={PRINT_AREA.top - 6}
                      fontSize="8"
                      fill="#666"
                    >
                      {cm}
                    </text>
                  </g>
                ))}

                {/* Règle verticale */}
                <rect x={PRINT_AREA.left - 18} y={PRINT_AREA.top} width="15" height={PRINT_AREA.height} fill="#f3f4f6" />
                {[0, 5, 10, 15, 20, 25, 30, 35, 40].map(cm => (
                  <g key={`ry-${cm}`}>
                    <line
                      x1={PRINT_AREA.left - 18}
                      y1={PRINT_AREA.top + cm * GRID_SIZE_PX}
                      x2={PRINT_AREA.left - 8}
                      y2={PRINT_AREA.top + cm * GRID_SIZE_PX}
                      stroke="#666"
                      strokeWidth="1"
                    />
                    <text
                      x={PRINT_AREA.left - 16}
                      y={PRINT_AREA.top + cm * GRID_SIZE_PX + 8}
                      fontSize="8"
                      fill="#666"
                    >
                      {cm}
                    </text>
                  </g>
                ))}
              </>
            )}
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

// Exporter les constantes
export const CANVAS_CONFIG = {
  REAL_WIDTH_CM,
  REAL_HEIGHT_CM,
  PX_PER_CM,
  GRID_SIZE_CM,
  GRID_SIZE_PX,
  PRINT_AREA,
};

export default DesignCanvas;
