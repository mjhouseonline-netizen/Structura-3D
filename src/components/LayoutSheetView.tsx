import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  Boxes,
  FileText,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Ruler,
  CheckCircle,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { formatMeasurement } from '../utils/units';

export const LayoutSheetView: React.FC = () => {
  const { project, objects, activeUnit, pages, activePageId } = useModelStore();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activePage = pages.find((p) => p.id === activePageId);

  // Compute 2D bounding box and floor area
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const obj of objects) {
    if (!obj.visible) continue;
    const halfW = obj.dimensions.width / 2;
    const halfD = obj.dimensions.depth / 2;
    minX = Math.min(minX, obj.position.x - halfW);
    maxX = Math.max(maxX, obj.position.x + halfW);
    minZ = Math.min(minZ, obj.position.z - halfD);
    maxZ = Math.max(maxZ, obj.position.z + halfD);
  }

  const modelWidth = maxX > minX ? maxX - minX : 5000;
  const modelLength = maxZ > minZ ? maxZ - minZ : 4000;
  const totalAreaM2 = ((modelWidth / 1000) * (modelLength / 1000)).toFixed(1);
  const totalAreaSqFt = (parseFloat(totalAreaM2) * 10.7639).toFixed(0);

  // 2D SVG canvas scaling
  const svgWidth = 800;
  const svgHeight = 560;
  const padding = 80;
  const maxModelExtent = Math.max(modelWidth, modelLength, 3000);
  const scale = (Math.min(svgWidth, svgHeight) - padding * 2) / maxModelExtent;

  // Convert 3D world coord (X, Z) to SVG 2D (x, y)
  const toSvgCoords = (x: number, z: number) => {
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    return {
      x: svgWidth / 2 + (x - cx) * scale,
      y: svgHeight / 2 + (z - cz) * scale,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  // Bill of Materials / Quantity Takeoff count
  const componentSummary = objects.reduce((acc: Record<string, number>, obj) => {
    const key = obj.name || obj.type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* LayOut Sheet Top Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-amber-400" />
          <span className="font-semibold text-white">LayOut 2D Architectural Sheet</span>
          <span className="text-[11px] text-slate-500 font-mono">Scale {activePage?.scale || '1:50'}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500"
            />
            <span className="text-[11px]">Dimensions</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 ml-2">
            <input
              type="checkbox"
              checked={showFurniture}
              onChange={(e) => setShowFurniture(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500"
            />
            <span className="text-[11px]">Furnishings</span>
          </label>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Printer size={13} />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Sheet Paper Container (Architectural Drafting Drawing Sheet) */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-start md:justify-center items-start md:items-center bg-slate-950/80">
        <div
          ref={sheetRef}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          className="w-[920px] bg-white text-slate-900 rounded-lg shadow-2xl border-4 border-slate-300 p-4 sm:p-6 flex flex-col justify-between transition-transform duration-150 shrink-0"
        >
          {/* Sheet Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase font-mono">
                {project.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                ARCHITECTURAL FLOOR PLAN & SPECIFICATION SHEET
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-bold text-xs rounded border border-amber-300">
                SHEET A-101
              </span>
            </div>
          </div>

          {/* 2D Orthographic Floor Plan SVG */}
          <div className="relative flex justify-center items-center border border-slate-200 bg-slate-50/50 rounded-lg p-2 min-h-[560px]">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              {/* Background Drafting Grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

              {/* Render Objects */}
              {objects.map((obj) => {
                if (!obj.visible) return null;
                const isWall = obj.type === 'wall';
                const isStructure = obj.tag === 'structure';
                const isFurniture = obj.tag === 'furniture' || obj.tag === 'kitchen';
                const isOpening = obj.type === 'door' || obj.type === 'window';

                if (!showFurniture && isFurniture) return null;

                const center = toSvgCoords(obj.position.x, obj.position.z);
                const w = Math.max(4, obj.dimensions.width * scale);
                const d = Math.max(4, obj.dimensions.depth * scale);

                // Wall rendering (solid black/dark architectural hatching)
                if (isWall) {
                  return (
                    <g key={obj.id}>
                      <rect
                        x={center.x - w / 2}
                        y={center.y - d / 2}
                        width={w}
                        height={d}
                        fill="#0f172a"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                }

                // Floor Slab
                if (isStructure) {
                  return (
                    <rect
                      key={obj.id}
                      x={center.x - w / 2}
                      y={center.y - d / 2}
                      width={w}
                      height={d}
                      fill="#f1f5f9"
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  );
                }

                // Doors & Windows
                if (isOpening) {
                  return (
                    <g key={obj.id}>
                      <rect
                        x={center.x - w / 2}
                        y={center.y - d / 2}
                        width={w}
                        height={d}
                        fill="#fff"
                        stroke={obj.type === 'door' ? '#d97706' : '#0284c7'}
                        strokeWidth="1.5"
                      />
                      {/* Door swing arc if door */}
                      {obj.type === 'door' && (
                        <path
                          d={`M ${center.x - w / 2} ${center.y - d / 2} A ${w} ${w} 0 0 1 ${
                            center.x + w / 2
                          } ${center.y + w}`}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                    </g>
                  );
                }

                // Furniture & fixtures
                return (
                  <g key={obj.id}>
                    <rect
                      x={center.x - w / 2}
                      y={center.y - d / 2}
                      width={w}
                      height={d}
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x={center.x}
                      y={center.y + 3}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#334155"
                      textAnchor="middle"
                      className="font-mono pointer-events-none"
                    >
                      {obj.name}
                    </text>
                  </g>
                );
              })}

              {/* Dimension Lines (Overall Width & Length) */}
              {showDimensions && (
                <g className="font-mono text-slate-800">
                  {/* Top Horizontal Dimension Line */}
                  <line
                    x1={toSvgCoords(minX, minZ).x}
                    y1={toSvgCoords(minX, minZ).y - 25}
                    x2={toSvgCoords(maxX, minZ).x}
                    y2={toSvgCoords(maxX, minZ).y - 25}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={toSvgCoords(minX, minZ).x}
                    y1={toSvgCoords(minX, minZ).y - 35}
                    x2={toSvgCoords(minX, minZ).x}
                    y2={toSvgCoords(minX, minZ).y - 15}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={toSvgCoords(maxX, minZ).x}
                    y1={toSvgCoords(maxX, minZ).y - 35}
                    x2={toSvgCoords(maxX, minZ).x}
                    y2={toSvgCoords(maxX, minZ).y - 15}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={(toSvgCoords(minX, minZ).x + toSvgCoords(maxX, minZ).x) / 2}
                    y={toSvgCoords(minX, minZ).y - 30}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#0284c7"
                    textAnchor="middle"
                  >
                    {formatMeasurement(modelWidth, activeUnit)}
                  </text>

                  {/* Left Vertical Dimension Line */}
                  <line
                    x1={toSvgCoords(minX, minZ).x - 25}
                    y1={toSvgCoords(minX, minZ).y}
                    x2={toSvgCoords(minX, maxZ).x - 25}
                    y2={toSvgCoords(minX, maxZ).y}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={toSvgCoords(minX, minZ).x - 35}
                    y1={toSvgCoords(minX, minZ).y}
                    x2={toSvgCoords(minX, minZ).x - 15}
                    y2={toSvgCoords(minX, minZ).y}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={toSvgCoords(minX, maxZ).x - 35}
                    y1={toSvgCoords(minX, maxZ).y}
                    x2={toSvgCoords(minX, maxZ).x - 15}
                    y2={toSvgCoords(minX, maxZ).y}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={toSvgCoords(minX, minZ).x - 32}
                    y={(toSvgCoords(minX, minZ).y + toSvgCoords(minX, maxZ).y) / 2}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#0284c7"
                    textAnchor="middle"
                    transform={`rotate(-90 ${toSvgCoords(minX, minZ).x - 32} ${
                      (toSvgCoords(minX, minZ).y + toSvgCoords(minX, maxZ).y) / 2
                    })`}
                  >
                    {formatMeasurement(modelLength, activeUnit)}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Quantity Takeoff & Schedule */}
          <div className="grid grid-cols-2 gap-4 my-4 pt-3 border-t border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1 font-mono">
                Component Schedule
              </h3>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {Object.entries(componentSummary).map(([name, count]) => (
                  <div key={name} className="flex justify-between border-b border-slate-100 py-0.5">
                    <span className="text-slate-600 truncate">{name}</span>
                    <span className="font-mono font-semibold text-slate-800">×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1 font-mono">
                Spatial Calculations
              </h3>
              <div className="space-y-1 text-slate-700 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Gross Floor Area:</span>
                  <span className="font-bold text-slate-900">
                    {totalAreaM2} m² ({totalAreaSqFt} sq ft)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Footprint Dimensions:</span>
                  <span>
                    {formatMeasurement(modelWidth, activeUnit)} ×{' '}
                    {formatMeasurement(modelLength, activeUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Drawing Scale:</span>
                  <span>{activePage?.scale || '1:50'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Architectural Title Block */}
          <div className="border-2 border-slate-900 p-3 grid grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50">
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase">PROJECT</span>
              <span className="font-bold text-slate-900 truncate block">{project.name}</span>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase">DRAWING TITLE</span>
              <span className="font-bold text-slate-900">{activePage?.title || 'Floor Plan'}</span>
            </div>
            <div className="border-r border-slate-300 pr-2">
              <span className="text-slate-500 block text-[9px] uppercase">DATE / REVISION</span>
              <span>{new Date().toLocaleDateString()} / Rev 1</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">STATUS</span>
              <span className="font-bold text-emerald-700">ISSUED FOR DESIGN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
