import React, { useState } from 'react';
import {
  MousePointer,
  Square,
  Pencil,
  ArrowUpFromLine,
  Boxes,
  PaintBucket,
  Package,
  Sparkles,
  SlidersHorizontal,
  Info,
  Layers,
  Camera,
  X,
  Plus,
  Home,
  Circle,
  Hexagon,
  Move,
  RotateCw,
  Scaling,
  Ruler,
  Eraser,
  Orbit,
  Hand,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { ToolType } from '../types/model';

export const MobileToolDock: React.FC = () => {
  const {
    activeTool,
    activeTab,
    isMobileDrawerOpen,
    presentationMode,
    selectedObjectIds,
  } = useModelStore();

  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);

  if (presentationMode) return null;

  const openPanelTab = (tab: 'properties' | 'library' | 'materials' | 'tags' | 'scenes' | 'ai') => {
    useModelStore.setState({ activeTab: tab, isMobileDrawerOpen: true });
    setIsToolsSheetOpen(false);
  };

  const selectTool = (tool: ToolType) => {
    modelActions.setTool(tool);
    useModelStore.setState({ mobileTouchMode: 'draw' });
    setIsToolsSheetOpen(false);
  };

  const allTools: { id: ToolType; label: string; icon: any }[] = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'line', label: 'Line', icon: Pencil },
    { id: 'pushpull', label: 'Push/Pull', icon: ArrowUpFromLine },
    { id: 'wall', label: 'Wall', icon: Boxes },
    { id: 'room', label: 'Room', icon: Home },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'polygon', label: 'Polygon', icon: Hexagon },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'scale', label: 'Scale', icon: Scaling },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'paint', label: 'Paint', icon: PaintBucket },
    { id: 'erase', label: 'Erase', icon: Eraser },
    { id: 'orbit', label: 'Orbit', icon: Orbit },
    { id: 'pan', label: 'Pan', icon: Hand },
  ];

  return (
    <>
      {/* Floating Bottom Touch Dock (Visible only on mobile/tablet screens < md) */}
      <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl max-w-[96vw] overflow-x-auto no-scrollbar">
        {/* Select */}
        <button
          data-tour="tool-select-mobile"
          onClick={() => selectTool('select')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'select'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Select Tool"
        >
          <MousePointer size={18} />
        </button>

        {/* Rectangle / Draw */}
        <button
          data-tour="tool-rectangle-mobile"
          onClick={() => selectTool('rectangle')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'rectangle'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Rectangle Tool"
        >
          <Square size={18} />
        </button>

        {/* Push / Pull Extrusion */}
        <button
          data-tour="tool-pushpull-mobile"
          onClick={() => selectTool('pushpull')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'pushpull'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Push/Pull Extrusion"
        >
          <ArrowUpFromLine size={18} />
        </button>

        {/* Wall Tool */}
        <button
          data-tour="tool-wall-mobile"
          onClick={() => selectTool('wall')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'wall'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Wall Builder"
        >
          <Boxes size={18} />
        </button>

        {/* Paint */}
        <button
          data-tour="tool-paint-mobile"
          onClick={() => selectTool('paint')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'paint'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Paint Materials"
        >
          <PaintBucket size={18} />
        </button>

        <div className="w-[1px] h-6 bg-slate-700/60 mx-0.5" />

        {/* Library Drawer Opener */}
        <button
          data-tour="tool-library-mobile"
          onClick={() => openPanelTab('library')}
          className="p-2 rounded-xl text-indigo-400 hover:text-indigo-200 transition-colors"
          title="Object Library"
        >
          <Package size={18} />
        </button>

        {/* AI Assistant Opener */}
        <button
          data-tour="panel-tab-ai-mobile"
          onClick={() => openPanelTab('ai')}
          className="p-2 rounded-xl text-sky-400 hover:text-sky-200 transition-colors"
          title="Gemini AI Assistant"
        >
          <Sparkles size={18} />
        </button>

        {/* Selected Entity Properties (if selected) */}
        {selectedObjectIds.length > 0 && (
          <button
            onClick={() => openPanelTab('properties')}
            className="p-2 rounded-xl text-emerald-400 hover:text-emerald-200 transition-colors"
            title="Entity Properties"
          >
            <Info size={18} />
          </button>
        )}

        {/* More Tools Button */}
        <button
          onClick={() => setIsToolsSheetOpen(!isToolsSheetOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="All Tools"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Mobile All-Tools Bottom Sheet Modal */}
      {isToolsSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-150"
          onClick={() => setIsToolsSheetOpen(false)}
        >
          <div
            className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 shadow-2xl space-y-3 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">All Modelling Tools</span>
              <button
                onClick={() => setIsToolsSheetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {allTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => selectTool(tool.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={20} className="mb-1" />
                    <span className="text-[11px] font-medium leading-tight">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Panels & Drawers
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => openPanelTab('properties')}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Info size={14} className="text-emerald-400" />
                  <span>Properties</span>
                </button>
                <button
                  onClick={() => openPanelTab('materials')}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <PaintBucket size={14} className="text-amber-400" />
                  <span>Materials</span>
                </button>
                <button
                  onClick={() => openPanelTab('tags')}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Layers size={14} className="text-sky-400" />
                  <span>Layers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
