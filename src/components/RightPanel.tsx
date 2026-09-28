import React, { useState } from 'react';
import {
  Info,
  Package,
  Palette,
  Layers,
  Camera,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Send,
  Loader2,
  RotateCcw,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { PRESET_MATERIALS } from '../engine/materials';
import { ObjectTag } from '../types/model';
import { formatMeasurement } from '../utils/units';

export const RightPanel: React.FC = () => {
  const {
    objects,
    selectedObjectIds,
    activeTab,
    activeMaterialId,
    activeColor,
    tags,
    savedScenes,
    aiLogs,
    isAiLoading,
    aiError,
    activeUnit,
    presentationMode,
    isMobileDrawerOpen,
    aiInputPrefill,
  } = useModelStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Sync clicked example prompts from Help Centre or tutorial into AI prompt textarea
  React.useEffect(() => {
    if (aiInputPrefill) {
      setAiPrompt(aiInputPrefill);
      useModelStore.setState({ aiInputPrefill: '' });
    }
  }, [aiInputPrefill]);

  if (presentationMode) return null;

  const selectedObject = objects.find((o) => o.id === selectedObjectIds[0]);

  // Object Library Definitions
  const libraryItems = [
    // Doors & Windows
    { type: 'door', name: 'Standard Interior Door', category: 'Doors & Windows', w: 900, h: 2100, d: 150, mat: 'wood-walnut' },
    { type: 'window', name: 'Panoramic Window', category: 'Doors & Windows', w: 1800, h: 1400, d: 150, mat: 'metal-matte-black' },
    // Furniture - Bedroom
    { type: 'queenBed', name: 'Queen Size Bed', category: 'Bedroom', w: 1600, h: 950, d: 2100, mat: 'wood-natural-oak' },
    { type: 'singleBed', name: 'Single Bed', category: 'Bedroom', w: 1000, h: 900, d: 2000, mat: 'wood-natural-oak' },
    { type: 'wardrobe', name: 'Double Wardrobe', category: 'Bedroom', w: 1600, h: 2100, d: 600, mat: 'wood-walnut' },
    // Furniture - Living
    { type: 'sofa3Seat', name: '3-Seater Sofa', category: 'Living Room', w: 2200, h: 780, d: 920, mat: 'fabric-charcoal-weave' },
    { type: 'coffeeTable', name: 'Timber Coffee Table', category: 'Living Room', w: 1200, h: 420, d: 650, mat: 'wood-natural-oak' },
    { type: 'armchair', name: 'Lounge Armchair', category: 'Living Room', w: 850, h: 820, d: 850, mat: 'fabric-natural-linen' },
    { type: 'bookshelf', name: 'Open Bookshelf', category: 'Living Room', w: 1000, h: 1800, d: 350, mat: 'wood-natural-oak' },
    // Dining & Office
    { type: 'diningTable', name: 'Dining Table (6-seater)', category: 'Dining & Office', w: 1800, h: 760, d: 900, mat: 'wood-natural-oak' },
    { type: 'diningChair', name: 'Modern Dining Chair', category: 'Dining & Office', w: 480, h: 840, d: 520, mat: 'fabric-charcoal-weave' },
    { type: 'officeDesk', name: 'Executive Desk', category: 'Dining & Office', w: 1500, h: 750, d: 750, mat: 'tiles-carrara-marble' },
    // Kitchen
    { type: 'kitchenIsland', name: 'Kitchen Island Unit', category: 'Kitchen', w: 2000, h: 900, d: 900, mat: 'tiles-carrara-marble' },
    { type: 'kitchenCounterSink', name: 'Sink Countertop Unit', category: 'Kitchen', w: 1200, h: 880, d: 600, mat: 'tiles-carrara-marble' },
    { type: 'kitchenBaseCabinet', name: 'Base Cabinet', category: 'Kitchen', w: 600, h: 880, d: 600, mat: 'paint-pure-white' },
    { type: 'refrigerator', name: 'French Door Fridge', category: 'Kitchen', w: 900, h: 1800, d: 700, mat: 'metal-brushed-steel' },
    // Bathroom
    { type: 'bathroomVanity', name: 'Bathroom Vanity Unit', category: 'Bathroom', w: 1000, h: 850, d: 500, mat: 'wood-walnut' },
    { type: 'bathtub', name: 'Freestanding Bathtub', category: 'Bathroom', w: 1700, h: 580, d: 800, mat: 'paint-pure-white' },
    { type: 'toilet', name: 'Modern Ceramic Toilet', category: 'Bathroom', w: 400, h: 800, d: 700, mat: 'paint-pure-white' },
    // Basic Shapes
    { type: 'box', name: 'Solid Cube / Box', category: 'Basic Shapes', w: 1000, h: 1000, d: 1000, mat: 'wood-natural-oak' },
    { type: 'cylinder', name: 'Solid Cylinder', category: 'Basic Shapes', w: 1000, h: 1000, d: 1000, mat: 'paint-warm-white' },
  ];

  const handleInsertLibraryItem = (item: (typeof libraryItems)[0]) => {
    const timestamp = Date.now();
    const newObj = {
      id: `obj-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      type: item.type === 'box' || item.type === 'cylinder' ? (item.type as any) : 'component',
      tag: (item.category === 'Kitchen'
        ? 'kitchen'
        : item.category === 'Bathroom'
        ? 'bathroom'
        : item.category === 'Doors & Windows'
        ? item.type === 'door'
          ? 'doors'
          : 'windows'
        : item.category === 'Basic Shapes'
        ? 'shapes'
        : 'furniture') as ObjectTag,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width: item.w, height: item.h, depth: item.d },
      materialId: item.mat,
      visible: true,
      locked: false,
      architecturalProps: { componentType: item.type },
    };

    modelActions.addObject(newObj, `Inserted ${item.name}`);
    modelActions.selectObject(newObj.id);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;
    modelActions.executeAiPrompt(aiPrompt);
    setAiPrompt('');
  };

  if (isCollapsed) {
    return (
      <div className="absolute right-0 top-13 bottom-10 z-20 flex items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-slate-900 border-l border-y border-slate-800 text-slate-400 hover:text-white p-2 rounded-l-lg shadow-xl"
          title="Expand Right Panel"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => useModelStore.setState({ isMobileDrawerOpen: false })}
        />
      )}

      <aside
        className={`bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none text-slate-300 transition-all ${
          isMobileDrawerOpen
            ? 'fixed inset-x-0 bottom-0 top-14 z-50 rounded-t-2xl shadow-2xl flex w-full'
            : 'hidden md:flex w-80 z-20'
        }`}
      >
        {/* Tab Navigation Header */}
        <div className="h-11 border-b border-slate-800 flex items-center justify-between px-2 bg-slate-950/40">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              data-tour="panel-tab-properties"
              onClick={() => useModelStore.setState({ activeTab: 'properties' })}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'properties'
                  ? 'bg-slate-800 text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Entity Properties"
            >
              <Info size={16} />
            </button>
            <button
              data-tour="panel-tab-library"
              onClick={() => useModelStore.setState({ activeTab: 'library' })}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'library'
                  ? 'bg-slate-800 text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Component Library"
            >
              <Package size={16} />
            </button>
            <button
              data-tour="panel-tab-materials"
              onClick={() => useModelStore.setState({ activeTab: 'materials' })}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'materials'
                  ? 'bg-slate-800 text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Materials & Colors"
            >
              <Palette size={16} />
            </button>
            <button
              data-tour="panel-tab-tags"
              onClick={() => useModelStore.setState({ activeTab: 'tags' })}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'tags'
                  ? 'bg-slate-800 text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tags / Layers"
            >
              <Layers size={16} />
            </button>
            <button
              data-tour="panel-tab-scenes"
              onClick={() => useModelStore.setState({ activeTab: 'scenes' })}
              className={`p-1.5 rounded transition-colors ${
                activeTab === 'scenes'
                  ? 'bg-slate-800 text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Saved Camera Scenes"
            >
              <Camera size={16} />
            </button>
            <button
              data-tour="panel-tab-ai"
              onClick={() => useModelStore.setState({ activeTab: 'ai' })}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 font-medium ring-1 ring-sky-500/30'
                  : 'text-sky-400 hover:text-sky-300'
              }`}
              title="AI Design Assistant"
            >
              <Sparkles size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close drawer button */}
            <button
              onClick={() => useModelStore.setState({ isMobileDrawerOpen: false })}
              className="md:hidden p-1 rounded text-slate-400 hover:text-white"
              title="Close Panel"
            >
              <X size={18} />
            </button>

            {/* Desktop collapse panel button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:block p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              title="Collapse Panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-4">
        {/* TAB 1: ENTITY PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {selectedObject ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm">
                    {selectedObject.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        modelActions.updateObject(selectedObject.id, {
                          locked: !selectedObject.locked,
                        })
                      }
                      title={selectedObject.locked ? 'Unlock' : 'Lock'}
                      className={`p-1 rounded ${
                        selectedObject.locked ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500'
                      }`}
                    >
                      {selectedObject.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                      onClick={() =>
                        modelActions.updateObject(selectedObject.id, {
                          visible: !selectedObject.visible,
                        })
                      }
                      title={selectedObject.visible ? 'Hide' : 'Show'}
                      className="p-1 rounded text-slate-500 hover:text-slate-300"
                    >
                      {selectedObject.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-400 text-[11px] uppercase tracking-wider">
                    Dimensions
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Width</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.dimensions.width)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            dimensions: {
                              ...selectedObject.dimensions,
                              width: Math.max(10, parseFloat(e.target.value) || 10),
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Height</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.dimensions.height)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            dimensions: {
                              ...selectedObject.dimensions,
                              height: Math.max(10, parseFloat(e.target.value) || 10),
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Depth</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.dimensions.depth)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            dimensions: {
                              ...selectedObject.dimensions,
                              depth: Math.max(10, parseFloat(e.target.value) || 10),
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Position Coordinates */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-400 text-[11px] uppercase tracking-wider">
                    Position (mm)
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-red-400 block">X</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.position.x)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            position: { ...selectedObject.position, x: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 block">Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.position.y)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            position: { ...selectedObject.position, y: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block">Z</span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.position.z)}
                        onChange={(e) =>
                          modelActions.updateObject(selectedObject.id, {
                            position: { ...selectedObject.position, z: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Layer / Tag Assignment */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-400 text-[11px] uppercase tracking-wider">
                    Tag / Layer
                  </div>
                  <select
                    value={selectedObject.tag}
                    onChange={(e) =>
                      modelActions.updateObject(selectedObject.id, {
                        tag: e.target.value as ObjectTag,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 outline-none"
                  >
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => modelActions.duplicateSelected()}
                    className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5"
                  >
                    <Copy size={13} />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => modelActions.deleteSelected()}
                    className="py-1.5 px-3 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Info size={32} className="mx-auto text-slate-600 stroke-1" />
                <p className="font-medium text-slate-400">No object selected</p>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  Click on any wall, face, or piece of furniture in the 3D scene to view and edit its
                  properties.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPONENT LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-medium">
              Click any architectural or interior component to insert it directly into the 3D space.
            </div>

            {Array.from(new Set(libraryItems.map((item) => item.category))).map((cat) => (
              <div key={cat} className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {cat}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {libraryItems
                    .filter((item) => item.category === cat)
                    .map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleInsertLibraryItem(item)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-left group"
                      >
                        <div>
                          <div className="font-medium text-slate-200 group-hover:text-sky-300 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {formatMeasurement(item.w, activeUnit)} ×{' '}
                            {formatMeasurement(item.d, activeUnit)}
                          </div>
                        </div>
                        <Plus size={15} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: MATERIALS & COLORS */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Material Browser</span>
              <button
                onClick={() => modelActions.applyActiveMaterial()}
                className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] shadow-sm"
              >
                Apply to Selection
              </button>
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-2 p-2 rounded bg-slate-950/60 border border-slate-800">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => useModelStore.setState({ activeColor: e.target.value })}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-mono text-slate-300">{activeColor}</span>
              <span className="text-[10px] text-slate-500 ml-auto">Custom Paint Color</span>
            </div>

            {/* Categorized Material Swatches */}
            {['paint', 'wood', 'flooring', 'tiles', 'stone', 'concrete', 'metal', 'glass', 'fabric'].map(
              (cat) => {
                const mats = PRESET_MATERIALS.filter((m) => m.category === cat);
                if (mats.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {cat}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {mats.map((mat) => {
                        const isSelected = activeMaterialId === mat.id;
                        return (
                          <button
                            key={mat.id}
                            onClick={() =>
                              useModelStore.setState({
                                activeMaterialId: mat.id,
                                activeColor: mat.color,
                              })
                            }
                            className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all text-left ${
                              isSelected
                                ? 'bg-sky-950/50 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-md border border-slate-700/60 shrink-0 shadow-sm"
                              style={{ backgroundColor: mat.color }}
                            />
                            <span className="truncate text-[11px] font-medium">{mat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* TAB 4: TAGS / LAYERS */}
        {activeTab === 'tags' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 font-medium">
              Control layer visibility and locking for organized architectural design.
            </div>

            <div className="space-y-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-slate-200">{tag.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => modelActions.toggleTagLock(tag.id)}
                      className={`p-1 rounded ${
                        tag.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={tag.locked ? 'Unlock Tag' : 'Lock Tag'}
                    >
                      {tag.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                      onClick={() => modelActions.toggleTagVisibility(tag.id)}
                      className={`p-1 rounded ${
                        tag.visible ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={tag.visible ? 'Hide Tag' : 'Show Tag'}
                    >
                      {tag.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SAVED CAMERA SCENES */}
        {activeTab === 'scenes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Camera Scenes</span>
              <button
                onClick={() => {
                  const name = prompt('Name for this camera viewpoint:', 'New Viewpoint');
                  if (name) {
                    modelActions.saveCameraScene(
                      name,
                      { x: 4500, y: 3500, z: 5500 },
                      { x: 0, y: 500, z: 0 }
                    );
                  }
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Save Current</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {savedScenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    if (scene.id === 'scene-iso') {
                      window.dispatchEvent(
                        new CustomEvent('structura_camera_action', { detail: { view: 'iso' } })
                      );
                    } else if (scene.id === 'scene-top') {
                      window.dispatchEvent(
                        new CustomEvent('structura_camera_action', { detail: { view: 'top' } })
                      );
                    } else if (scene.id === 'scene-front') {
                      window.dispatchEvent(
                        new CustomEvent('structura_camera_action', { detail: { view: 'front' } })
                      );
                    }
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Camera size={14} className="text-sky-400" />
                    <span className="font-medium text-slate-200">{scene.name}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GEMINI AI DESIGN ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-sky-950/60 to-indigo-950/60 p-3 rounded-xl border border-sky-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-sky-300">
                <Sparkles size={16} />
                <span>Gemini AI Design Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Describe whole rooms, architectural adjustments, or furniture layouts in natural language.
                Gemini translates your brief into validated 3D modelling commands.
              </p>
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleAiSubmit} className="space-y-2">
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Create a 5m x 6m bedroom with a queen bed against the back wall, two windows, and light oak floor'..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-sky-500/20"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Constructing 3D Geometry...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Execute Design Command</span>
                  </>
                )}
              </button>
            </form>

            {aiError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-[11px]">
                {aiError}
              </div>
            )}

            {/* Example Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Quick Prompt Ideas:</span>
              <div className="space-y-1">
                {[
                  'Create a 6m x 8m open-plan living room with an L-shaped kitchen and 2m island',
                  'Add a 900mm door to the left wall and a panoramic window on the back wall',
                  'Place a queen bed against the back wall with bedside tables',
                  'Change all flooring to herringbone parquet',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setAiPrompt(chip)}
                    className="w-full text-left p-1.5 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-colors truncate"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </div>

            {/* AI History Logs with Undo */}
            {aiLogs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  AI Design History
                </span>
                <div className="space-y-2">
                  {aiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
                    >
                      <div className="font-medium text-slate-200 text-[11px] italic">
                        "{log.prompt}"
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{log.explanation}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.commandsCount} operations
                        </span>
                        <button
                          onClick={() => modelActions.revertAiLog(log.id)}
                          className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                        >
                          <RotateCcw size={11} />
                          <span>Undo AI Step</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  </>
  );
};
