import React, { useState } from 'react';
import {
  X,
  BookOpen,
  MousePointer,
  Pencil,
  Square,
  Circle,
  Hexagon,
  ArrowUpFromLine,
  Boxes,
  Home,
  Move,
  RotateCw,
  Scaling,
  Ruler,
  PaintBucket,
  Eraser,
  Orbit,
  Hand,
  Sparkles,
  FileText,
  Search,
  ExternalLink,
  Keyboard,
  Compass,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useModelStore } from '../state/useModelStore';

export const InstructionsModal: React.FC = () => {
  const { isInstructionsOpen } = useModelStore();
  const [activeCategory, setActiveCategory] = useState<
    'start' | 'tools' | 'snapping' | 'vcb' | 'pages' | 'ai' | 'shortcuts'
  >('start');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isInstructionsOpen) return null;

  const close = () => {
    useModelStore.setState({ isInstructionsOpen: false });
  };

  const openInteractiveTour = () => {
    useModelStore.setState({ isInstructionsOpen: false, isTourOpen: true });
  };

  const navCategories = [
    { id: 'start', label: 'Quick Start', icon: BookOpen },
    { id: 'tools', label: 'Modelling Tools', icon: Pencil },
    { id: 'snapping', label: 'Snapping & Inference', icon: Compass },
    { id: 'vcb', label: 'Measurements (VCB)', icon: Ruler },
    { id: 'pages', label: 'Pages & 2D LayOut', icon: FileText },
    { id: 'ai', label: 'Gemini AI Assistant', icon: Sparkles },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[92vh] sm:h-[640px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Structura 3D User Guide
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Direct intuitive 3D spatial modelling inspired by Google SketchUp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openInteractiveTour}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <HelpCircle size={14} />
              <span className="hidden sm:inline">Walkthrough Tour</span>
              <span className="sm:hidden">Tour</span>
            </button>
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area with Sidebar Navigation */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Navigation Sidebar / Horizontal Tab Bar on Mobile */}
          <div className="w-full sm:w-52 bg-slate-950/40 border-b sm:border-b-0 sm:border-r border-slate-800 p-2 sm:p-3 flex sm:flex-col gap-1 shrink-0 overflow-x-auto sm:overflow-y-auto no-scrollbar">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors text-left shrink-0 whitespace-nowrap sm:whitespace-normal ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Guide Documentation Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
            {/* 1. QUICK START */}
            {activeCategory === 'start' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    The 4 Core Steps of Direct 3D Modelling
                  </h3>
                  <p className="text-slate-400">
                    Structura 3D operates on the core principle of direct modelling: drawing 2D shapes
                    directly inside 3D space, snapping to real geometric points, and extruding surfaces
                    into solid architectural forms.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-sky-400">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">
                        1
                      </span>
                      <span>Draw a 2D Shape</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">R</kbd> for
                      Rectangle or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">L</kbd> for
                      Line. Click a start point on the ground grid or any existing surface, then click the
                      opposite corner to create a flat face.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                        2
                      </span>
                      <span>Push / Pull Extrude into 3D</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      Select the Push/Pull tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">U</kbd>).
                      Hover over any face—it will highlight. Click and drag upward or downward to extrude it
                      into a 3D volumetric solid volume.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-amber-400">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">
                        3
                      </span>
                      <span>Type Exact Measurements</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      You never need to click the measurement box first. While drawing or extruding, simply
                      type your dimension (e.g. <code className="text-amber-300">2400</code> or{' '}
                      <code className="text-amber-300">4000, 3000</code>) and press Enter!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-indigo-400">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">
                        4
                      </span>
                      <span>Add Doors, Windows & Materials</span>
                    </div>
                    <p className="text-slate-400 leading-normal">
                      Use the Component Library in the right panel or the Wall tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">W</kbd>)
                      to place doors, windows, cabinetry, and furniture. Click Paint (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">B</kbd>)
                      to apply realistic timber, tiles, marble, or paints.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-800/40 space-y-2">
                  <h4 className="font-semibold text-sky-300 text-xs">Mouse & Camera Controls:</h4>
                  <ul className="space-y-1 text-slate-300 text-xs">
                    <li>
                      <strong>Orbit:</strong> Drag with <em>Middle Mouse Button</em> or <em>Alt + Left Click Drag</em> (or press <kbd>O</kbd>).
                    </li>
                    <li>
                      <strong>Pan:</strong> Hold <em>Shift</em> + <em>Middle Mouse Drag</em> (or press <kbd>H</kbd> for Hand).
                    </li>
                    <li>
                      <strong>Zoom:</strong> Scroll the mouse wheel up/down to zoom smoothly toward your cursor.
                    </li>
                    <li>
                      <strong>Standard Views:</strong> Use the quick <em>Iso</em>, <em>Top</em>, <em>Front</em>, and <em>Right</em> buttons at the top right of the canvas.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. MODELLING TOOLS REFERENCE */}
            {activeCategory === 'tools' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Left Toolbar Reference</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Select Tool (Space / V)', desc: 'Click to select objects or faces. Hold Shift to select multiple items. Click empty space to deselect.' },
                    { name: 'Line Tool (L)', desc: 'Click a start point, move along inference axes, and click end point. Connected lines that form a closed coplanar loop create a 2D surface face.' },
                    { name: 'Rectangle Tool (R)', desc: 'Click first corner on the ground grid or existing surface, move diagonally, and click the opposite corner. Automatically creates a face.' },
                    { name: 'Circle Tool (C)', desc: 'Click center point, drag outward to set radius, and click to create a circular face. Enter exact radius in the measurement box.' },
                    { name: 'Polygon Tool (P)', desc: 'Click center point and radius to create regular polygons (configurable number of sides: 3 to 12).' },
                    { name: 'Push / Pull Extrusion (U)', desc: 'Hover over any 2D face, click and drag along the normal vector outward or inward to extrude into a 3D volumetric solid.' },
                    { name: 'Wall Builder (W)', desc: 'Click start and endpoints to draw continuous 3D walls with real thickness (e.g. 150mm) and height (e.g. 2400mm).' },
                    { name: 'Room Generator (Shift+R)', desc: 'Draw a complete 4-wall room with floor slab in a single diagonal drag.' },
                    { name: 'Move Tool (M)', desc: 'Select an object, click a base point, and drag along X, Y, or Z axis with live snapping.' },
                    { name: 'Rotate Tool (Q)', desc: 'Click a rotation pivot and drag mouse with 15° snap increments. Type exact angle (e.g. 45 or 90).' },
                    { name: 'Scale Tool (S)', desc: 'Scale selected objects uniformly or along specific axis dimensions.' },
                    { name: 'Tape Measure (T)', desc: 'Click two points in the 3D scene to inspect exact distances, lengths, and clearances.' },
                    { name: 'Paint Bucket (B)', desc: 'Click any object or face to apply the currently selected procedural PBR material or color.' },
                    { name: 'Erase Tool (E)', desc: 'Click on any edge, face, or 3D object to immediately remove it from your model.' },
                  ].map((tool, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="font-semibold text-sky-300 mb-0.5">{tool.name}</div>
                      <div className="text-slate-400">{tool.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SNAPPING & INFERENCE */}
            {activeCategory === 'snapping' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Intelligent Snapping & Inference</h3>
                <p className="text-slate-400">
                  SketchUp-style geometric inference ensures your drawing lines and objects are always
                  perfectly aligned and accurate down to the millimeter.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Green Square — Endpoint Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Snaps precisely to any vertex or corner of an existing line, wall, or object.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Cyan Circle — Midpoint Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Snaps exactly halfway along any edge or wall segment.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Magenta Circle — Center Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Snaps to the geometric centroid of circles, polygons, or component volumes.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded bg-red-500 shadow-sm shadow-red-500/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Red Dashed Guide — On Red Axis (X)</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking along the horizontal X-axis (Width).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Green Dashed Guide — On Green Axis (Z)</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking along the horizontal Z-axis (Depth).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded bg-blue-500 shadow-sm shadow-blue-500/50 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Blue Dashed Guide — On Blue Axis (Y)</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking vertically (Height).
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VALUE CONTROL BOX (VCB) */}
            {activeCategory === 'vcb' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">The Value Control Box (VCB)</h3>
                <p className="text-slate-400">
                  Located in the bottom-right corner of the interface, the Value Control Box displays live
                  measurements as you move your mouse and lets you specify exact numeric values.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-sky-300">How to Enter Dimensions:</h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>
                      <strong>Single Dimension:</strong> Type <code className="text-amber-300 font-mono">2400</code> and press <kbd>Enter</kbd> to set a line length, wall height, or push/pull depth.
                    </li>
                    <li>
                      <strong>Dual Dimensions:</strong> Type <code className="text-amber-300 font-mono">5000, 4000</code> or <code className="text-amber-300 font-mono">5m x 4m</code> to set width and length for a rectangle or room.
                    </li>
                    <li>
                      <strong>Unit Suffixes:</strong> You can append explicit units like <code className="text-sky-300">2.4m</code>, <code className="text-sky-300">150mm</code>, <code className="text-sky-300">8ft</code>, or <code className="text-sky-300">96in</code>. The app converts it automatically!
                    </li>
                    <li>
                      <strong>Active Unit Selector:</strong> Change project units between <code className="text-slate-200">mm</code>, <code className="text-slate-200">cm</code>, <code className="text-slate-200">m</code>, <code className="text-slate-200">in</code>, and <code className="text-slate-200">ft</code> in the bottom bar without altering existing object scales.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 5. PAGES & 2D LAYOUT */}
            {activeCategory === 'pages' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Pages & 2D LayOut Drawing Sheets</h3>
                <p className="text-slate-400">
                  Structura 3D includes a multi-page management bar right beneath the top toolbar:
                </p>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-semibold text-sky-300">3D Design Spaces:</span>
                    <p className="text-slate-400">
                      Create multiple floors (e.g. Ground Floor, First Floor) or duplicate an existing space
                      to test layout variations (Option A vs Option B) while keeping the original safe.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-semibold text-amber-300">2D LayOut Blueprint Sheets:</span>
                    <p className="text-slate-400">
                      Inspired by SketchUp LayOut, this page type turns your 3D model into a professional
                      2D architectural presentation sheet. It features:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5 pt-1">
                      <li>Scaled top-down orthographic floor plan projection</li>
                      <li>Automatic dimension strings & area calculations (gross floor area in m² and sq ft)</li>
                      <li>Bill of Materials / Component Schedule listing all items</li>
                      <li>Architectural Title Block ready for printing or exporting to PDF/PNG</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-200">Page Management:</span>
                    <p className="text-slate-400">
                      Double-click any page tab to rename it. Click the <kbd>...</kbd> icon to duplicate or
                      delete pages.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. GEMINI AI ASSISTANT */}
            {activeCategory === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Gemini AI Design Assistant</h3>
                <p className="text-slate-400">
                  Gemini translates natural-language design prompts into validated, structured 3D operations.
                  Access it via the Sparkles tab in the right-hand panel.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-sky-300">Example Prompts You Can Try:</h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <em>"Create a room 4 metres wide and 5 metres long with 2.4m high walls."</em></li>
                    <li>• <em>"Add a 900mm door to the centre of the left wall."</em></li>
                    <li>• <em>"Add two panoramic windows evenly spaced across the back wall."</em></li>
                    <li>• <em>"Place a queen bed against the back wall with bedside tables on both sides."</em></li>
                    <li>• <em>"Change the flooring to light oak parquet."</em></li>
                    <li>• <em>"Create a 6m x 8m open-plan living space with an L-shaped kitchen, 2m island, dining table for six, and sofa facing a TV wall."</em></li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200 text-[11px]">
                  <strong>AI History & Undo:</strong> Every command executed by Gemini is logged in the AI
                  History panel. You can inspect what was built and click <strong>"Undo AI Step"</strong> to
                  instantly revert any operation.
                </div>
              </div>
            )}

            {/* 7. KEYBOARD SHORTCUTS CHEAT SHEET */}
            {activeCategory === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Keyboard Shortcuts Reference</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'Space / V', action: 'Select Tool' },
                    { key: 'L', action: 'Line Tool' },
                    { key: 'R', action: 'Rectangle Tool' },
                    { key: 'C', action: 'Circle Tool' },
                    { key: 'P', action: 'Polygon Tool' },
                    { key: 'U', action: 'Push / Pull Extrude' },
                    { key: 'W', action: 'Wall Builder' },
                    { key: 'Shift + R', action: 'Room Generator' },
                    { key: 'M', action: 'Move Tool' },
                    { key: 'Q', action: 'Rotate Tool' },
                    { key: 'S', action: 'Scale Tool' },
                    { key: 'T', action: 'Tape Measure' },
                    { key: 'B', action: 'Paint / Material' },
                    { key: 'E', action: 'Erase / Delete' },
                    { key: 'O', action: 'Orbit Camera' },
                    { key: 'H', action: 'Pan Camera' },
                    { key: 'Ctrl / Cmd + Z', action: 'Undo' },
                    { key: 'Ctrl / Cmd + Y', action: 'Redo' },
                    { key: 'Del / Backspace', action: 'Delete Selected' },
                    { key: 'Esc', action: 'Deselect All' },
                    { key: '0-9', action: 'Focus Measurements Box' },
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800"
                    >
                      <span className="text-slate-300 font-medium">{sc.action}</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-950/60 text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Esc</kbd> anytime to cancel or close dialogs.</span>
          <button
            onClick={close}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
