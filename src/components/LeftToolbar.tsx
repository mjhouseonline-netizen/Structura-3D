import React from 'react';
import {
  MousePointer,
  Pencil,
  Square,
  Circle,
  Hexagon,
  ArrowUpFromLine,
  Move,
  RotateCw,
  Scaling,
  Ruler,
  PaintBucket,
  Eraser,
  Orbit,
  Hand,
  Boxes,
  Home,
  DoorOpen,
  LayoutGrid,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { ToolType } from '../types/model';

interface ToolItem {
  id: ToolType;
  label: string;
  description: string;
  shortcut: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section?: string;
}

export const LeftToolbar: React.FC = () => {
  const { activeTool, presentationMode, isLibraryOpen } = useModelStore();

  if (presentationMode) return null;

  const tools: ToolItem[] = [
    {
      id: 'select',
      label: 'Select',
      description: 'Click to select objects or faces. Hold Shift to select multiple items.',
      shortcut: 'Space / V',
      icon: MousePointer,
    },
    {
      id: 'line',
      label: 'Line',
      description: 'Draw straight lines between points. Closed shapes create a face.',
      shortcut: 'L',
      icon: Pencil,
    },
    {
      id: 'rectangle',
      label: 'Rectangle',
      description: 'Draw a rectangular face on the ground or on any surface.',
      shortcut: 'R',
      icon: Square,
    },
    {
      id: 'circle',
      label: 'Circle',
      description: 'Draw a circular face with a specified radius.',
      shortcut: 'C',
      icon: Circle,
    },
    {
      id: 'polygon',
      label: 'Polygon',
      description: 'Draw regular 3 to 12-sided polygons.',
      shortcut: 'P',
      icon: Hexagon,
    },
    {
      id: 'pushpull',
      label: 'Push / Pull',
      description: 'Turn a flat face into a 3D shape by pulling it outward or pushing it inward.',
      shortcut: 'U',
      icon: ArrowUpFromLine,
    },
    {
      id: 'wall',
      label: 'Wall Builder',
      description: 'Draw a measured wall between two points.',
      shortcut: 'W',
      icon: Boxes,
    },
    {
      id: 'room',
      label: 'Room Generator',
      description: 'Create a 4-wall room complete with floor slab in a single drag.',
      shortcut: 'Shift + R',
      icon: Home,
    },
    {
      id: 'move',
      label: 'Move',
      description: 'Move the selected object. Snap to an axis or enter an exact distance.',
      shortcut: 'M',
      icon: Move,
    },
    {
      id: 'rotate',
      label: 'Rotate',
      description: 'Rotate selected objects around a chosen point or axis.',
      shortcut: 'Q',
      icon: RotateCw,
    },
    {
      id: 'scale',
      label: 'Scale',
      description: 'Resize objects by dragging bounding handles or entering dimensions.',
      shortcut: 'S',
      icon: Scaling,
    },
    {
      id: 'measure',
      label: 'Tape Measure',
      description: 'Measure distances between any two points in the 3D space.',
      shortcut: 'T',
      icon: Ruler,
    },
    {
      id: 'paint',
      label: 'Paint / Material',
      description: 'Apply colors, timber, tiles, marble, or textures to faces.',
      shortcut: 'B',
      icon: PaintBucket,
    },
    {
      id: 'erase',
      label: 'Erase / Delete',
      description: 'Click any line, face, or object to delete it.',
      shortcut: 'E',
      icon: Eraser,
    },
    {
      id: 'orbit',
      label: 'Orbit Camera',
      description: 'Rotate your camera view around the model.',
      shortcut: 'O',
      icon: Orbit,
    },
    {
      id: 'pan',
      label: 'Pan Camera',
      description: 'Slide the camera view horizontally or vertically.',
      shortcut: 'H',
      icon: Hand,
    },
  ];

  return (
    <aside className="hidden md:flex w-13 bg-slate-900 border-r border-slate-800 flex-col items-center py-2.5 gap-1 shrink-0 z-20 select-none">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <div key={tool.id} className="relative group">
            <button
              data-tour={`tool-${tool.id}`}
              onClick={() => modelActions.setTool(tool.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <Icon size={19} />
            </button>

            {/* Informative Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-52 p-2.5 bg-slate-950 text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 space-y-1">
              <div className="flex items-center justify-between font-bold text-sky-400">
                <span>{tool.label}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {tool.shortcut}
                </kbd>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{tool.description}</p>
            </div>
          </div>
        );
      })}

      <div className="w-6 h-[1px] bg-slate-800 my-1" />

      {/* Reusable Object Library Toggle */}
      <div className="relative group">
        <button
          data-tour="tool-library"
          onClick={() =>
            useModelStore.setState((prev) => ({
              activeTab: 'library',
              isLibraryOpen: !prev.isLibraryOpen,
            }))
          }
          title="Component / Object Library"
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            isLibraryOpen
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
              : 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/40'
          }`}
        >
          <LayoutGrid size={19} />
        </button>

        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2.5 bg-slate-950 text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 space-y-0.5">
          <div className="font-bold text-indigo-400">Component Library</div>
          <p className="text-[11px] text-slate-300">
            Browse and insert parametric doors, windows, and furnishings.
          </p>
        </div>
      </div>
    </aside>
  );
};
