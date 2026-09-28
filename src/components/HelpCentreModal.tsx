import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  MousePointer,
  Pencil,
  Square,
  Circle,
  Hexagon,
  ArrowUpFromLine,
  Boxes,
  Home,
  DoorOpen,
  AppWindow,
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
  Keyboard,
  Compass,
  Download,
  FolderOpen,
  Save,
  RotateCcw,
  Redo2,
  Lock,
  Eye,
  Layers,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';

export const HelpCentreModal: React.FC = () => {
  const { isInstructionsOpen, isHelpOpen, initialHelpSection, isTourOpen } = useModelStore();
  const isOpen = (isInstructionsOpen || isHelpOpen) && !isTourOpen;

  const [activeSection, setActiveSection] = useState<string>(initialHelpSection || 'getting-started');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    if (initialHelpSection) {
      setActiveSection(initialHelpSection);
    }
  }, [initialHelpSection, isOpen]);

  if (!isOpen) return null;

  const close = () => {
    useModelStore.setState({ isInstructionsOpen: false, isHelpOpen: false });
  };

  const startTutorial = () => {
    close();
    modelActions.startInteractiveTutorial();
  };

  const handleUseAiPrompt = (promptText: string) => {
    modelActions.setAiInputPrefill(promptText);
  };

  // Section categories for the navigation sidebar
  const sections = [
    { id: 'getting-started', title: '1. Getting Started', icon: BookOpen },
    { id: 'navigation', title: '2. 3D Workspace Navigation', icon: Orbit },
    { id: 'selecting', title: '3. Selecting & Organizing', icon: MousePointer },
    { id: 'drawing', title: '4. Drawing Shapes & Faces', icon: Pencil },
    { id: 'pushpull', title: '5. Push / Pull 3D Extrusion', icon: ArrowUpFromLine },
    { id: 'measurements', title: '6. Measurements & Units (VCB)', icon: Ruler },
    { id: 'snapping', title: '7. Snapping & Inference Guides', icon: Compass },
    { id: 'moving', title: '8. Moving Objects', icon: Move },
    { id: 'rotating', title: '9. Rotating Objects', icon: RotateCw },
    { id: 'resizing', title: '10. Resizing & Scaling', icon: Scaling },
    { id: 'walls', title: '11. Creating Measured Walls', icon: Boxes },
    { id: 'room', title: '12. Creating a Complete Room', icon: Home },
    { id: 'doors', title: '13. Placing Doors', icon: DoorOpen },
    { id: 'windows', title: '14. Placing Windows', icon: AppWindow },
    { id: 'furniture', title: '15. Furniture & Component Library', icon: Layers },
    { id: 'materials', title: '16. Materials & Colours', icon: PaintBucket },
    { id: 'groups', title: '17. Groups, Tags & Layers', icon: Layers },
    { id: 'projects', title: '18. Projects, Save & Autosave', icon: Save },
    { id: 'undo-redo', title: '19. Undo & Redo', icon: RotateCcw },
    { id: 'exporting', title: '20. Exporting (PNG, JSON, PDF)', icon: Download },
    { id: 'ai-assistant', title: '21. Gemini AI Assistant', icon: Sparkles },
    { id: 'shortcuts', title: '22. Keyboard & Mouse Reference', icon: Keyboard },
  ];

  // Filter sections when user searches
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q) || s.id.includes(q));
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[94vh] sm:h-[680px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="h-15 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Structura 3D Help & Learning Centre</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 hidden sm:inline">
                  Beginner Friendly
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Everything you need to know to create architectural spaces and 3D designs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startTutorial}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Build Your First Room (Tutorial)</span>
              <span className="sm:hidden">Start Tutorial</span>
            </button>

            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Help Centre"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. walls, push/pull, measurements, doors, AI)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 hidden md:inline ml-auto">
            Click any topic below to view step-by-step instructions
          </span>
        </div>

        {/* Main Content: Sidebar + Article Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Menu */}
          <div className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-2 md:p-3 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 flex md:flex-col gap-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap md:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Article Detail Content View */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-300 text-xs leading-relaxed select-text">
            {/* 1. GETTING STARTED */}
            {activeSection === 'getting-started' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">1. Getting Started with Structura 3D</h3>
                  <p className="text-slate-400">
                    Structura 3D is designed for beginners and professionals alike. You can create complete measured 3D spaces in two ways: <strong>manually drawing with the modelling tools</strong> or <strong>describing what you want in plain language to the Gemini AI Assistant</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sky-400 text-sm">Understanding the Main Workspace Areas:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">1. 3D Workspace (Centre)</span>
                      <p className="text-slate-400 text-[11px]">
                        The interactive 3D canvas with ground grid, directional lighting, and colored reference axes (Red X = Width, Green Z = Depth, Blue Y = Height). This is where your design comes to life.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2. Left Modelling Toolbar</span>
                      <p className="text-slate-400 text-[11px]">
                        Contains all primary creation and manipulation tools: Select, Line, Rectangle, Circle, Polygon, Push/Pull, Wall, Room, Move, Rotate, Scale, Measure, Paint, and Erase.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">3. Top Project Toolbar</span>
                      <p className="text-slate-400 text-[11px]">
                        Manage projects: Rename, New Blank Canvas, Open file, Download project, Undo, Redo, Duplicate, Delete, Camera Preset Views, Export (PNG/JSON), and Theme Toggle.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">4. Right Properties & Library Panel</span>
                      <p className="text-slate-400 text-[11px]">
                        Tabs for exact object dimensions (W/H/D), coordinates (X/Y/Z), Component Library (furniture/fixtures), Material Swatches, Layer Tags, and Saved Camera Scenes.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">5. Measurement Area / VCB (Bottom-Right)</span>
                      <p className="text-slate-400 text-[11px]">
                        The Value Control Box. Shows real-time millimeter/inch readings as you move your mouse. You can type exact dimensions anytime and press Enter!
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">6. Gemini AI Assistant (Right Panel Tab)</span>
                      <p className="text-slate-400 text-[11px]">
                        Describe entire rooms, furniture layouts, materials, or adjustments in normal sentences. Gemini builds the 3D geometry instantly with a one-click undo option.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-sky-200">
                  <p className="font-semibold text-xs mb-1">Manual vs. AI: Which should you use?</p>
                  <p className="text-[11px] text-slate-300">
                    You can mix both! Ask the AI to generate a starter layout (e.g. <em>"Create a 5m x 6m bedroom with oak flooring"</em>), then use the manual tools to fine-tune furniture positions, adjust dimensions, or paint custom colors.
                  </p>
                </div>
              </div>
            )}

            {/* 2. 3D WORKSPACE NAVIGATION */}
            {activeSection === 'navigation' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">2. Navigating the 3D Workspace</h3>
                  <p className="text-slate-400">
                    Effortlessly move, rotate, and zoom your perspective around the model using simple mouse, trackpad, or keyboard controls.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Orbit size={16} className="text-sky-400" />
                      <span>Orbit (Rotate View Around Model)</span>
                    </span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      <li><strong>Mouse:</strong> Click and drag with the <strong>Middle Mouse Wheel</strong> button.</li>
                      <li><strong>Alternative:</strong> Hold <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Alt</kbd> and drag with the <strong>Left Mouse Button</strong>.</li>
                      <li><strong>Toolbar:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">O</kbd> to activate the Orbit tool, then left-click drag.</li>
                      <li><strong>Touch / Mobile:</strong> Drag with 1 finger when in Orbit mode.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Hand size={16} className="text-emerald-400" />
                      <span>Pan (Slide Across the Workspace)</span>
                    </span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      <li><strong>Mouse:</strong> Hold <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Shift</kbd> + drag with the <strong>Middle Mouse Wheel</strong> button.</li>
                      <li><strong>Toolbar:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">H</kbd> to activate the Hand / Pan tool, then left-click drag.</li>
                      <li><strong>Touch / Mobile:</strong> Drag with 2 fingers simultaneously.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Search size={16} className="text-amber-400" />
                      <span>Zoom (Closer or Farther)</span>
                    </span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      <li><strong>Mouse:</strong> Scroll the mouse wheel up or down. Structura 3D zooms directly towards your mouse pointer.</li>
                      <li><strong>Touch / Mobile:</strong> Pinch two fingers together or apart.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">Preset Standard Camera Views & Reset</span>
                    <p className="text-slate-300 text-[11px]">
                      Located at the top-right of the 3D canvas (and in the <strong>Views</strong> menu in the top bar):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Iso (Perspective):</strong> Standard 3D angle.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Top (Floor Plan):</strong> Directly above (bird's eye).
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Front Elevation:</strong> Looking directly from the front.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Back Elevation:</strong> Looking from the rear wall.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Right / Left Views:</strong> Side profile views.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-sky-300">
                        <strong>Fit Extents:</strong> Instantly centers all objects on screen.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SELECTING OBJECTS */}
            {activeSection === 'selecting' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">3. Selecting, Inspecting & Organizing</h3>
                  <p className="text-slate-400">
                    Learn how to select walls, faces, and furniture items to edit their properties, duplicate, or delete them.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">How to Select:</span>
                    <p className="text-slate-400 text-[11px]">
                      Activate the <strong>Select Tool</strong> by pressing <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">V</kbd>. Click on any 3D object, wall, or face. A bright cyan boundary outline appears around the selected item.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">Selecting Multiple Objects:</span>
                    <p className="text-slate-400 text-[11px]">
                      Hold down the <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Shift</kbd> key while clicking items to select multiple objects at the same time.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">Deselecting:</span>
                    <p className="text-slate-400 text-[11px]">
                      Click any empty area of the grid or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Esc</kbd> to clear your selection.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">Properties Panel Inspection:</span>
                    <p className="text-slate-400 text-[11px]">
                      Whenever an item is selected, its exact Width, Height, Depth, X/Y/Z positions, assigned layer tag, and material swatch immediately appear in the right-hand <strong>Properties</strong> tab. You can type new numbers into these fields to adjust dimensions down to the millimeter!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <Copy size={16} className="mx-auto text-sky-400 mb-1" />
                      <span className="font-bold text-white block text-[11px]">Duplicate</span>
                      <span className="text-[10px] text-slate-400">Ctrl+D or top bar</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <Trash2 size={16} className="mx-auto text-red-400 mb-1" />
                      <span className="font-bold text-white block text-[11px]">Delete</span>
                      <span className="text-[10px] text-slate-400">Del / Backspace</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <Lock size={16} className="mx-auto text-amber-400 mb-1" />
                      <span className="font-bold text-white block text-[11px]">Lock / Unlock</span>
                      <span className="text-[10px] text-slate-400">Prevents accidental moves</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <Eye size={16} className="mx-auto text-slate-400 mb-1" />
                      <span className="font-bold text-white block text-[11px]">Hide / Show</span>
                      <span className="text-[10px] text-slate-400">Toggles visibility</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DRAWING */}
            {activeSection === 'drawing' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">4. Drawing 2D Shapes & Faces</h3>
                  <p className="text-slate-400">
                    Direct drawing is the foundation of 3D modelling. In Structura 3D, drawing on any flat surface or on the ground plane creates 2D coplanar faces that can immediately be extruded into 3D.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Square size={16} className="text-sky-400" />
                      <span>Rectangle Tool (Shortcut: R)</span>
                    </span>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Choose <strong>Rectangle</strong> from the left toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">R</kbd>.</li>
                      <li>Click where the first corner should begin.</li>
                      <li>Move your mouse across the ground or face to preview the rectangle dimensions.</li>
                      <li>Click the opposite corner to finish.</li>
                      <li><em>Optional:</em> Type exact dimensions like <code className="text-amber-300 font-mono">4000, 3000</code> and press Enter!</li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Pencil size={16} className="text-emerald-400" />
                      <span>Line Tool (Shortcut: L)</span>
                    </span>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Choose <strong>Line</strong> from the left toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">L</kbd>.</li>
                      <li>Click your start point.</li>
                      <li>Move the cursor along the inference axes (watch for the Red, Green, or Blue dashed guide lines).</li>
                      <li>Click to set the end point.</li>
                      <li><strong>Closed Shapes Create Faces:</strong> When you connect 3 or more lines back to the starting point, Structura 3D automatically recognizes the closed loop and generates a 2D editable face surface!</li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Circle size={16} className="text-pink-400" />
                      <span>Circle Tool (Shortcut: C)</span>
                    </span>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Choose <strong>Circle</strong> from the toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">C</kbd>.</li>
                      <li>Click where the center of the circle should be.</li>
                      <li>Drag outward to adjust the radius and click to create the circular face.</li>
                      <li>Type an exact radius (e.g. <code className="text-amber-300 font-mono">600</code>) and press Enter.</li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Hexagon size={16} className="text-amber-400" />
                      <span>Polygon Tool (Shortcut: P)</span>
                    </span>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Choose <strong>Polygon</strong> from the toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">P</kbd>.</li>
                      <li>Click to set the center point, move outward, and click to complete.</li>
                      <li>Creates regular polygons (e.g. hexagon, octagon) that can be extruded into columns, tables, or decorative pedestals.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PUSH / PULL TUTORIAL */}
            {activeSection === 'pushpull' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase">
                      Core 3D Feature
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 mb-1">5. Push / Pull 3D Extrusion</h3>
                  <p className="text-slate-400">
                    Push/Pull is the signature direct modelling tool that turns any flat 2D face into a 3D volumetric solid shape or wall.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Step-by-Step Push/Pull Process:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px]">
                    <li><strong>Draw or select a flat 2D face:</strong> For example, draw a rectangle on the ground plane.</li>
                    <li><strong>Choose Push/Pull:</strong> Click the Push/Pull icon in the left toolbar or press the <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">U</kbd> shortcut.</li>
                    <li><strong>Hover over the face:</strong> Notice that the target surface highlights with a soft glow, indicating it is ready to extrude.</li>
                    <li><strong>Click and drag:</strong> Move your mouse upward (or outward along the face's normal direction) to add depth, or inward to reduce it.</li>
                    <li><strong>Enter exact distance:</strong> As you drag, you can type an exact height (such as <code className="text-amber-300 font-mono">2400</code>) and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd>.</li>
                    <li><strong>Click to confirm:</strong> Release or click again to finalize your 3D solid!</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-sky-950/50 border border-indigo-800/40 space-y-2">
                  <h4 className="font-bold text-indigo-300 text-xs uppercase tracking-wide">
                    Beginner Hands-On Example: Extrude a 3D Room Box
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    1. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">R</kbd> (Rectangle tool). Click on the ground, move the mouse, and type <code className="text-amber-300 font-mono">4000, 5000</code> then press Enter.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    2. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">U</kbd> (Push/Pull tool). Hover over the rectangle face you just drew.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    3. Click once, drag your mouse upward, type <code className="text-amber-300 font-mono">2400</code>, and press Enter. You now have a solid 4m × 5m × 2.4m architectural volume!
                  </p>
                </div>
              </div>
            )}

            {/* 6. MEASUREMENTS & UNITS */}
            {activeSection === 'measurements' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">6. Measurements & Exact Typing (VCB)</h3>
                  <p className="text-slate-400">
                    Never struggle with trying to stop your mouse cursor on exact millimeter numbers. Structura 3D features a SketchUp-style <strong>Value Control Box (VCB)</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">Supported Units</span>
                    <p className="text-slate-400 text-[11px]">
                      Structura 3D supports five industry standard measurement units:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sky-300">
                        mm (Millimeters)
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sky-300">
                        cm (Centimeters)
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sky-300">
                        m (Meters)
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sky-300">
                        in (Inches)
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sky-300">
                        ft (Feet)
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">How to Change Units</span>
                    <p className="text-slate-400 text-[11px]">
                      In the bottom bar on the right side, click the unit dropdown (e.g. <strong>mm</strong>) and select your preferred unit. All live on-screen measurements will immediately display in your chosen unit.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">How Exact Typing Works While Drawing:</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1.5">
                      <li>You <strong>do not need to click into the measurement box</strong>. Simply start drawing a line, wall, or rectangle, and start typing digits on your keyboard.</li>
                      <li><strong>Single values:</strong> Type <code className="text-amber-300 font-mono">2400</code> for a line length, wall height, or push/pull depth.</li>
                      <li><strong>Dual values:</strong> Type <code className="text-amber-300 font-mono">4000, 3000</code> or <code className="text-amber-300 font-mono">4m x 3m</code> for a rectangle's width and length.</li>
                      <li>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd> to apply the exact dimension instantly.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Ruler size={16} className="text-sky-400" />
                      <span>Tape Measure Tool (Shortcut: T)</span>
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Select the Tape Measure tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">T</kbd>). Click point A, then move your cursor to point B. A measured dimension line appears in 3D space with a floating measurement label showing the exact distance and clearance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SNAPPING */}
            {activeSection === 'snapping' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">7. Snapping & Geometric Inference</h3>
                  <p className="text-slate-400">
                    Snapping automatically aligns your cursor with critical geometric points and axes so your 3D models are always true, square, and accurate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Green Square — Endpoint Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Locks to the exact corner or vertex of a line, wall, or object.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Cyan Circle — Midpoint Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Locks precisely to the 50% midpoint of any edge or wall.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Magenta Circle — Center Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Locks to the center of a circle, polygon, or component volume.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-amber-500 shadow-sm shadow-amber-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">On Edge / Face Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Ensures your drawing point lies directly on an existing surface.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-red-500 shadow-sm shadow-red-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Red Dashed Line — X Axis</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking along the horizontal width direction.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Green Dashed Line — Z Axis</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking along the horizontal depth direction.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-blue-500 shadow-sm shadow-blue-500/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Blue Dashed Line — Y Axis</span>
                      <span className="text-slate-400 text-[11px]">
                        Inference locking vertically along height direction.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded bg-slate-400 shadow-sm shadow-slate-400/50 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Grid Snap</span>
                      <span className="text-slate-400 text-[11px]">
                        Snaps coordinates to round 100mm, 500mm, or 1000mm intervals.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                  <strong>Snapping Toggles:</strong> You can toggle Grid Snapping, Geometry Snapping, or Axis Inference on or off at any time using the 3 icons in the bottom bar.
                </div>
              </div>
            )}

            {/* 8. MOVING OBJECTS */}
            {activeSection === 'moving' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">8. Moving Objects</h3>
                  <p className="text-slate-400">
                    Reposition any wall, door, piece of furniture, or volume anywhere in the 3D scene.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <span className="font-bold text-white text-sm">Step-by-Step Moving Instructions:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li><strong>Select the object:</strong> Click on the object you want to move (it will highlight).</li>
                    <li><strong>Choose Move Tool:</strong> Click the Move icon in the left toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">M</kbd>.</li>
                    <li><strong>Click a base point:</strong> Click on a corner or reference point on the object to grab it.</li>
                    <li><strong>Drag along an axis:</strong> Move your cursor. Watch for the Red (X) or Green (Z) inference guides to move in a straight line.</li>
                    <li><strong>Enter exact distance:</strong> While moving, type an exact offset (e.g. <code className="text-amber-300 font-mono">500</code>) and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd>.</li>
                    <li><strong>Click to release:</strong> Click to lock the object into its new location.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 9. ROTATING OBJECTS */}
            {activeSection === 'rotating' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">9. Rotating Objects</h3>
                  <p className="text-slate-400">
                    Rotate furniture, walls, or groups around any angle or snap to standard 15° increments.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <span className="font-bold text-white text-sm">Step-by-Step Rotation:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li><strong>Select the object:</strong> Click the object to highlight it.</li>
                    <li><strong>Choose Rotate Tool:</strong> Click the Rotate icon in the toolbar or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Q</kbd>.</li>
                    <li><strong>Set the rotation pivot:</strong> Click on the center or corner of the object to establish the rotation axis.</li>
                    <li><strong>Drag to rotate:</strong> Move your mouse in an arc. The tool automatically snaps to convenient 15°, 45°, and 90° angles.</li>
                    <li><strong>Enter exact degrees:</strong> Type <code className="text-amber-300 font-mono">90</code> or <code className="text-amber-300 font-mono">45</code> and press Enter.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 10. RESIZING OBJECTS */}
            {activeSection === 'resizing' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">10. Resizing & Scaling</h3>
                  <p className="text-slate-400">
                    Adjust dimensions either visually using the Scale tool or down to the exact millimeter in the Properties panel.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm">Method 1: Exact Millimeter Editing in Properties Panel (Recommended)</span>
                    <p className="text-slate-300 text-[11px]">
                      Select the object, open the <strong>Properties</strong> tab in the right panel, and change the <strong>Width</strong>, <strong>Height</strong>, or <strong>Depth</strong> input fields. The 3D model immediately updates to the exact specified measurements.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm">Method 2: Scale Tool (Shortcut: S)</span>
                    <p className="text-slate-300 text-[11px]">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">S</kbd>. Drag bounding box handles to scale the object uniformly or stretch along a specific direction.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 11. CREATING WALLS */}
            {activeSection === 'walls' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">11. Creating Measured Walls</h3>
                  <p className="text-slate-400">
                    Draw architectural walls with real physical thickness and height that seamlessly connect at corners.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <span className="font-bold text-white text-sm">How to Draw Walls:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li><strong>Choose Wall:</strong> Click the Wall icon or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">W</kbd>.</li>
                    <li><strong>Click starting position:</strong> Click where the wall begins.</li>
                    <li><strong>Move cursor:</strong> Notice the 3D wall preview with real thickness.</li>
                    <li><strong>Click ending position:</strong> Click to place the wall segment, or type an exact length like <code className="text-amber-300 font-mono">4500</code> and press Enter.</li>
                    <li><strong>Connecting walls:</strong> Hover near the corner of an existing wall. The Green Endpoint snap locks to it so corners meet seamlessly without gaps.</li>
                    <li><strong>Change measurements later:</strong> Click any wall with the Select tool to change its Height or Thickness anytime in the Properties panel!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 12. CREATING A COMPLETE ROOM */}
            {activeSection === 'room' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">12. Creating a Complete Room</h3>
                  <p className="text-slate-400">
                    The fastest way to start an architectural project: generate all 4 connected perimeter walls and a floor slab in a single action.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">The Fastest Method (Room Tool):</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Shift + R</kbd> to activate the <strong>Room Generator</strong>.</li>
                    <li>Click where the first corner should be.</li>
                    <li>Drag diagonally across the ground.</li>
                    <li>Type your width and length: <code className="text-amber-300 font-mono">4000, 5000</code> (4m × 5m).</li>
                    <li>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd>.</li>
                  </ol>
                  <p className="text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg">
                    ✓ All 4 walls (2.4m high, 100mm thick) and the floor slab are generated together instantly!
                  </p>
                </div>
              </div>
            )}

            {/* 13. DOORS */}
            {activeSection === 'doors' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">13. Placing & Customizing Doors</h3>
                  <p className="text-slate-400">
                    Place realistic architectural doors into walls with frames, door leaves, and lever handles.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">How to Insert a Door:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Open the <strong>Component Library</strong> tab in the right panel.</li>
                      <li>Find <strong>Doors & Windows</strong> and click <strong>Standard Interior Door (900mm)</strong>.</li>
                      <li>The door is inserted into the scene.</li>
                      <li>Use the <strong>Move</strong> tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">M</kbd>) to slide it directly against or inside your wall.</li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-sm">Customizing Door Dimensions:</span>
                    <p className="text-slate-400 text-[11px]">
                      Select the door and open the Properties panel to adjust <strong>Width</strong> (e.g. 800mm, 900mm, 1000mm) or <strong>Height</strong> (e.g. 2100mm standard). In the 2D LayOut drawing sheet, the door automatically renders with an architectural 90° swing arc!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 14. WINDOWS */}
            {activeSection === 'windows' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">14. Placing & Customizing Windows</h3>
                  <p className="text-slate-400">
                    Add glazed architectural windows with realistic glass transparency and frame mullions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-sm">Placing a Window:</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>From the <strong>Component Library</strong>, select <strong>Panoramic Window</strong>.</li>
                    <li>Move the window onto the desired wall.</li>
                    <li><strong>Setting Height from Floor (Sill Height):</strong> Select the window, and in the Properties panel under <strong>Position Y</strong>, enter <code className="text-amber-300 font-mono">900</code> (900mm standard sill height above floor level).</li>
                    <li>Adjust Width (e.g. 1400mm or 1800mm) and Height (e.g. 1200mm) to match your architectural elevation.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 15. FURNITURE & COMPONENT LIBRARY */}
            {activeSection === 'furniture' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">15. Furniture & Component Library</h3>
                  <p className="text-slate-400">
                    Structura 3D includes a built-in library of procedural 3D components ready to place into your rooms.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">Available Library Categories:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Living Room:</strong> 3-seater sofas, armchairs, coffee tables, bookshelves.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Bedroom:</strong> Queen beds, single beds, double wardrobes.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Dining & Office:</strong> 6-seater dining tables, modern chairs, desks.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Kitchen:</strong> 2m islands, sink counters, base cabinets, fridges.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Bathroom:</strong> Vanity units, freestanding bathtubs, ceramic toilets.
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong>Basic Solids:</strong> Cubes, boxes, cylinders, and columns.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-sm">Managing Placed Furniture:</span>
                    <p className="text-slate-400 text-[11px]">
                      Click to insert an object, then use <strong>Move (M)</strong> to position it, <strong>Rotate (Q)</strong> to orient it, <strong>Duplicate (Ctrl+D)</strong> to make copies, or <strong>Delete (Del)</strong> to remove it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 16. MATERIALS & COLOURS */}
            {activeSection === 'materials' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">16. Materials & Colours</h3>
                  <p className="text-slate-400">
                    Apply realistic PBR procedural materials including timber hardwoods, parquet, marble, tiles, concrete, metal, glass, and custom paints.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <span className="font-bold text-white text-sm">How to Apply Materials:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li><strong>Method A (Paint Tool):</strong> Click the <strong>Paint Bucket</strong> tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">B</kbd>). Select a material from the Materials tab on the right, then click on any face or object in the 3D scene to paint it immediately.</li>
                    <li><strong>Method B (Selection):</strong> Select an object with the Select tool (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">V</kbd>), open the <strong>Materials</strong> tab in the right panel, select a material or pick a custom hex color with the color picker, and click <strong>"Apply to Selection"</strong>.</li>
                    <li><strong>Changing Materials Later:</strong> You can re-paint any surface at any time without having to rebuild the geometry.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 17. GROUPS & LAYERS */}
            {activeSection === 'groups' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">17. Groups, Tags & Layers</h3>
                  <p className="text-slate-400">
                    Keep complex architectural models organized by organizing items into layers (tags).
                  </p>
                </div>

                <div className="space-y-3 text-[11px]">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-sm">Why Organizing with Tags is Useful:</span>
                    <p className="text-slate-400">
                      As your building grows, you might want to view the floor plan without furniture, or lock the structural walls so they can't be accidentally moved while you decorate.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-sm">How to Use Tags / Layers:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Open the <strong>Tags / Layers</strong> tab in the right panel.</li>
                      <li>Click the <strong>Eye icon</strong> next to any tag (e.g. <em>Furniture</em> or <em>Kitchen</em>) to hide or show that entire category.</li>
                      <li>Click the <strong>Padlock icon</strong> to lock a layer so its objects cannot be selected, dragged, or deleted.</li>
                      <li>Assign any selected object to a layer by choosing its tag in the Properties panel dropdown.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 18. PROJECTS */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">18. Projects, Saving & Autosave</h3>
                  <p className="text-slate-400">
                    Understand how your work is saved and how to export personal project backups.
                  </p>
                </div>

                <div className="space-y-3 text-[11px]">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 space-y-1">
                    <span className="font-bold text-sm block">Autosave in Your Browser</span>
                    <p className="text-slate-300">
                      Structura 3D automatically saves your project to your local browser storage after changes. If you accidentally refresh the page, your work will be restored automatically.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 space-y-1">
                    <span className="font-bold text-sm block">CRITICAL: Export Your Project File (.json) for Backups!</span>
                    <p className="text-slate-300">
                      Browser storage can be cleared if you clear your browser cache or switch computers. To keep a safe backup or share your work, always click <strong>Save / Download Project</strong> (or Export → Project File) in the top toolbar. This downloads a <code className="text-amber-300 font-mono">.structura.json</code> file to your computer that you can reopen at any time with the <strong>Open Project</strong> folder button!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <strong>New Project:</strong> Click the <kbd>+</kbd> button in the top bar to reset to a clean blank workspace.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <strong>Rename Project:</strong> Click directly on the project name in the top bar and type a new name.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <strong>Duplicate Project / Page:</strong> Use the Pages bar below the top bar to duplicate design variations.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 19. UNDO & REDO */}
            {activeSection === 'undo-redo' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">19. Undo & Redo System</h3>
                  <p className="text-slate-400">
                    Work with complete confidence knowing every change can be reversed.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                  <p>
                    <strong>Manual Changes:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Ctrl + Z</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Cmd + Z</kbd> on Mac) or click the Undo arrow in the top toolbar to undo drawing, moving, resizing, or deletion steps. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Ctrl + Y</kbd> to Redo.
                  </p>
                  <p>
                    <strong>AI Changes:</strong> When Gemini creates or changes objects, the exact step is recorded in the <strong>AI Design History</strong> inside the AI panel. Click <strong>"Undo AI Step"</strong> to revert any AI-generated layout instantly!
                  </p>
                </div>
              </div>
            )}

            {/* 20. EXPORTING */}
            {activeSection === 'exporting' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">20. Exporting Your Work</h3>
                  <p className="text-slate-400">
                    Export high-resolution presentations, project files, and scaled architectural documentation.
                  </p>
                </div>

                <div className="space-y-2.5 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs">1. High-Resolution PNG Image Render</span>
                    <p className="text-slate-400">
                      Click <strong>Export → Image (PNG)</strong> in the top toolbar to capture a crystal-clear render of your current camera view with shadows, textures, and lighting.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs">2. Presentation Mode (Clean Screenshots)</span>
                    <p className="text-slate-400">
                      Click the <strong>Eye icon</strong> in the top toolbar to toggle Presentation Mode. This hides all toolbars and UI panels, giving you an uncluttered full-screen view ideal for client walkthroughs or taking clean screenshots.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs">3. Project Backup (.structura.json)</span>
                    <p className="text-slate-400">
                      Saves your complete model state, all pages, custom materials, and camera scenes into an open JSON file format.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs">4. 2D LayOut Architectural Blueprint (Print / PDF)</span>
                    <p className="text-slate-400">
                      In the Pages tab bar, click <strong>"2D LayOut Blueprint Sheet"</strong>. This generates a scaled architectural sheet with dimensions, gross floor area calculations ($m^2$ and $sq\ ft$), component schedule, and title block. Click <strong>"Print Sheet"</strong> to export to PDF or print directly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 21. GEMINI AI ASSISTANT */}
            {activeSection === 'ai-assistant' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 text-[10px] font-bold uppercase border border-sky-500/30">
                      AI Powered
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 mb-1">21. Gemini AI Design Assistant</h3>
                  <p className="text-slate-400">
                    You don't need to build everything manually. Describe your vision in plain English, and Gemini translates your words into validated 3D geometry!
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sky-400 text-xs">
                    Click Any Example Prompt to Try It in the AI Assistant:
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      'Create a room 4 metres wide and 5 metres long with 2.4 metre walls.',
                      'Add a 900mm door in the centre of the left wall.',
                      'Put two windows evenly across the back wall.',
                      'Add a queen bed against the back wall.',
                      'Move the bed 300mm to the left.',
                      'Make this wall 600mm longer.',
                      'Change the flooring to light oak.',
                      'Create an L-shaped kitchen along the back and right walls.',
                      'Add a 2 metre kitchen island.',
                      'Delete the selected chair.',
                      'Make the selected cabinet 100mm wider.',
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUseAiPrompt(prompt)}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
                      >
                        <span className="italic">"{prompt}"</span>
                        <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 flex items-center gap-1 font-semibold">
                          <span>Use Prompt</span>
                          <ArrowRight size={12} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <strong>Iterative Design:</strong> Gemini works directly with your existing scene. You can start by asking for a room, then add doors, then furnish, then refine measurements step-by-step.
                </div>
              </div>
            )}

            {/* 22. KEYBOARD & MOUSE REFERENCE */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white mb-1">22. Keyboard & Mouse Quick Reference</h3>
                  <p className="text-slate-400">
                    A compact reference of all active keyboard shortcuts and mouse interactions in Structura 3D.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sky-400 text-xs uppercase tracking-wider">
                    Modelling Tool Shortcuts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'Space / V', action: 'Select Tool' },
                      { key: 'L', action: 'Line Tool (Draw edges & closed faces)' },
                      { key: 'R', action: 'Rectangle Tool' },
                      { key: 'C', action: 'Circle Tool' },
                      { key: 'P', action: 'Polygon Tool' },
                      { key: 'U', action: 'Push / Pull Extrude Tool' },
                      { key: 'W', action: 'Wall Builder Tool' },
                      { key: 'Shift + R', action: 'Room Generator Tool' },
                      { key: 'M', action: 'Move Tool' },
                      { key: 'Q', action: 'Rotate Tool' },
                      { key: 'S', action: 'Scale Tool' },
                      { key: 'T', action: 'Tape Measure Tool' },
                      { key: 'B', action: 'Paint Bucket Tool' },
                      { key: 'E', action: 'Erase / Delete Tool' },
                      { key: 'O', action: 'Orbit Camera Tool' },
                      { key: 'H', action: 'Pan Camera (Hand) Tool' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800"
                      >
                        <span className="text-slate-300">{item.action}</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold text-sky-400 text-xs uppercase tracking-wider pt-2">
                    System & Navigation Shortcuts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'Middle Drag', action: 'Orbit Camera View' },
                      { key: 'Shift + Middle Drag', action: 'Pan Camera View' },
                      { key: 'Mouse Wheel', action: 'Zoom In / Out' },
                      { key: 'Ctrl / Cmd + Z', action: 'Undo last action' },
                      { key: 'Ctrl / Cmd + Y', action: 'Redo last action' },
                      { key: 'Ctrl / Cmd + D', action: 'Duplicate selected object' },
                      { key: 'Delete / Backspace', action: 'Delete selected object' },
                      { key: 'Escape', action: 'Deselect all / Cancel drawing' },
                      { key: 'Digits (0-9)', action: 'Type measurement in VCB' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800"
                      >
                        <span className="text-slate-300">{item.action}</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-950/70 text-xs text-slate-400">
          <button
            onClick={startTutorial}
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Sparkles size={14} />
            <span>Launch "Build Your First Room" Interactive Tutorial</span>
          </button>

          <button
            onClick={close}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
          >
            Back to Design
          </button>
        </div>
      </div>
    </div>
  );
};
