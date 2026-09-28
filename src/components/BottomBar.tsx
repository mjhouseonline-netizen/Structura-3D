import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Magnet,
  Compass,
  CornerDownLeft,
  ChevronDown,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { UnitType } from '../types/model';
import { parseDimensionInput, parseDualDimensions } from '../utils/units';
import { ContextHelpTooltip } from './ContextHelpTooltip';

export const BottomBar: React.FC = () => {
  const {
    activeTool,
    activeUnit,
    vcbPrompt,
    vcbValue,
    statusHint,
    enableGridSnap,
    enableGeometrySnap,
    enableAxisSnap,
    gridStepMm,
    selectedObjectIds,
    objects,
    presentationMode,
  } = useModelStore();

  const [inputVal, setInputVal] = useState(vcbValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal store vcbValue to local inputVal
  useEffect(() => {
    setInputVal(vcbValue);
  }, [vcbValue]);

  if (presentationMode) return null;

  // Handle typing exact measurement into the VCB Value Control Box
  const handleVcbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    // Check if modifying active selected object or last drawn object
    if (selectedObjectIds.length > 0) {
      const selected = objects.find((o) => o.id === selectedObjectIds[0]);
      if (selected) {
        // If single dimension entered (e.g. "2400" for height or length)
        const single = parseDimensionInput(inputVal, activeUnit);
        const dual = parseDualDimensions(inputVal, activeUnit);

        if (dual) {
          // Width & Depth
          modelActions.updateObject(
            selected.id,
            {
              dimensions: {
                ...selected.dimensions,
                width: dual[0],
                depth: dual[1],
              },
            },
            `Set dimensions to ${inputVal}`
          );
        } else if (single !== null) {
          if (activeTool === 'pushpull') {
            modelActions.pushPull(selected.id, single);
          } else {
            // Apply to height or width
            modelActions.updateObject(
              selected.id,
              {
                dimensions: {
                  ...selected.dimensions,
                  height: single,
                },
              },
              `Set height to ${inputVal}`
            );
          }
        }
      }
    } else if (activeTool === 'room') {
      const dual = parseDualDimensions(inputVal, activeUnit);
      if (dual) {
        modelActions.createRoom(dual[0], dual[1]);
      }
    }
  };

  // Keyboard shortcut listener to focus VCB whenever user starts typing numbers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if already inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Check tool shortcuts
      const key = e.key.toLowerCase();
      if (key === 'v' || key === ' ') {
        e.preventDefault();
        modelActions.setTool('select');
      } else if (key === 'l') {
        e.preventDefault();
        modelActions.setTool('line');
      } else if (key === 'r' && !e.shiftKey) {
        e.preventDefault();
        modelActions.setTool('rectangle');
      } else if (key === 'r' && e.shiftKey) {
        e.preventDefault();
        modelActions.setTool('room');
      } else if (key === 'c') {
        e.preventDefault();
        modelActions.setTool('circle');
      } else if (key === 'p') {
        e.preventDefault();
        modelActions.setTool('polygon');
      } else if (key === 'u') {
        e.preventDefault();
        modelActions.setTool('pushpull');
      } else if (key === 'w') {
        e.preventDefault();
        modelActions.setTool('wall');
      } else if (key === 'm') {
        e.preventDefault();
        modelActions.setTool('move');
      } else if (key === 'q') {
        e.preventDefault();
        modelActions.setTool('rotate');
      } else if (key === 's') {
        e.preventDefault();
        modelActions.setTool('scale');
      } else if (key === 't') {
        e.preventDefault();
        modelActions.setTool('measure');
      } else if (key === 'b') {
        e.preventDefault();
        modelActions.setTool('paint');
      } else if (key === 'e') {
        e.preventDefault();
        modelActions.setTool('erase');
      } else if (key === 'o') {
        e.preventDefault();
        modelActions.setTool('orbit');
      } else if (key === 'h') {
        e.preventDefault();
        modelActions.setTool('pan');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectIds.length > 0) {
          e.preventDefault();
          modelActions.deleteSelected();
        }
      } else if (e.key === 'Escape') {
        modelActions.deselectAll();
      } else if (/^[0-9.,xX]$/.test(e.key)) {
        // User typed a digit! Focus VCB input box
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds]);

  return (
    <footer className="h-10 bg-slate-900 border-t border-slate-800 text-slate-300 px-3 flex items-center justify-between shrink-0 select-none z-20 text-xs">
      {/* Left: Active Tool and Status Guide Hint */}
      <div className="flex items-center gap-2 max-w-[48%] truncate">
        <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold uppercase tracking-wider text-[10px]">
          {activeTool}
        </span>
        <span className="text-slate-400 truncate hidden sm:inline" title={statusHint}>
          {statusHint}
        </span>
      </div>

      {/* Right: Snapping Toggles, Unit Selector, and VCB (Value Control Box) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Snapping Toggles */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
          <button
            onClick={() =>
              useModelStore.setState((prev) => ({ enableGridSnap: !prev.enableGridSnap }))
            }
            title={`Grid Snapping: ${enableGridSnap ? 'ON' : 'OFF'}`}
            className={`p-1 rounded transition-colors ${
              enableGridSnap ? 'text-sky-400 bg-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid size={14} />
          </button>

          <button
            onClick={() =>
              useModelStore.setState((prev) => ({ enableGeometrySnap: !prev.enableGeometrySnap }))
            }
            title={`Geometry Snapping (Endpoints/Midpoints/Faces): ${
              enableGeometrySnap ? 'ON' : 'OFF'
            }`}
            className={`p-1 rounded transition-colors ${
              enableGeometrySnap
                ? 'text-emerald-400 bg-slate-700'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Magnet size={14} />
          </button>

          <button
            onClick={() =>
              useModelStore.setState((prev) => ({ enableAxisSnap: !prev.enableAxisSnap }))
            }
            title={`Axis Inference Snapping (Red/Green/Blue): ${enableAxisSnap ? 'ON' : 'OFF'}`}
            className={`p-1 rounded transition-colors ${
              enableAxisSnap ? 'text-amber-400 bg-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Compass size={14} />
          </button>

          <ContextHelpTooltip
            title="Snapping & Inference"
            description="Automatically locks your drawing cursor to grid points, object corners (endpoints), edge midpoints, face centers, and colored X/Y/Z guide axes."
            tip="Toggle any snapping mode off if you need completely freehand placement."
          />
        </div>

        {/* Project Unit Selector */}
        <div data-tour="unit-selector" className="relative flex items-center gap-1">
          <select
            value={activeUnit}
            onChange={(e) => modelActions.setUnit(e.target.value as UnitType)}
            className="bg-slate-800 text-slate-200 border border-slate-700/80 rounded px-1.5 py-1 text-xs font-mono outline-none cursor-pointer hover:border-slate-600 focus:border-sky-500"
            title="Active Model Measurement Units"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
            <option value="in">in</option>
            <option value="ft">ft</option>
          </select>
          <ContextHelpTooltip
            title="Units of Measurement"
            description="Choose between millimeters, centimeters, meters, inches, or feet. All existing geometry scales smoothly."
            tip="You can type explicit units (e.g. 2.4m or 96in) anytime while drawing."
          />
        </div>

        {/* VCB (Value Control Box) Measurement Entry - SketchUp core experience! */}
        <form data-tour="vcb-measurements" onSubmit={handleVcbSubmit} className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden md:inline">
            {vcbPrompt}
          </span>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                modelActions.setVcbValue(e.target.value);
              }}
              placeholder="e.g. 2400"
              title="Measurements Box: Type exact distance or dimensions and press Enter"
              className="w-20 sm:w-28 md:w-36 bg-slate-950 border border-sky-500/40 rounded px-2 py-1 text-xs text-sky-300 font-mono font-semibold focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              title="Apply exact measurement"
              className="absolute right-1 text-slate-500 hover:text-sky-300 transition-colors"
            >
              <CornerDownLeft size={12} />
            </button>
          </div>
          <ContextHelpTooltip
            title="Value Control Box (VCB)"
            description="While drawing, moving, or extruding, simply start typing numbers on your keyboard (e.g. 2400 or 4000, 3000) and press Enter to set exact dimensions."
            tip="No need to click this input first—typing any digit automatically activates it."
          />
        </form>
      </div>
    </footer>
  );
};
