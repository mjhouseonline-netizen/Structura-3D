import React, { useState } from 'react';
import {
  X,
  Orbit,
  Hand,
  Search,
  Pencil,
  ArrowUpFromLine,
  Ruler,
  Sparkles,
  MousePointer,
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
} from 'lucide-react';
import { useModelStore } from '../state/useModelStore';

interface Step {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string[];
  shortcut?: string;
  tip?: string;
}

export const WalkthroughModal: React.FC = () => {
  const { isTourOpen } = useModelStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isTourOpen) return null;

  const steps: Step[] = [
    {
      title: 'Welcome to Structura 3D',
      subtitle: 'Direct 3D Spatial Modelling Inspired by Google SketchUp',
      icon: Sparkles,
      description: [
        'Structura 3D allows you to draw architectural designs, rooms, cabinetry, and furniture layouts directly inside a 3D workspace.',
        'Use direct face drawing, Push/Pull volumetric extrusion, smart snapping, and precise dimensions to turn flat concepts into real 3D designs.',
      ],
      tip: 'This quick 1-minute guide will show you the essential tools.',
    },
    {
      title: 'Navigating 3D Space',
      subtitle: 'Orbit, Pan, and Zoom Smoothly',
      icon: Orbit,
      description: [
        'Orbit: Drag with Middle Mouse Button, Alt + Left Drag, or press "O" for the Orbit tool.',
        'Pan: Shift + Middle Mouse Drag, or press "H" for the Hand / Pan tool.',
        'Zoom: Scroll the mouse wheel up or down to zoom toward your cursor position.',
      ],
      shortcut: 'Middle-Click to Orbit, Shift+Middle-Click to Pan',
      tip: 'Use standard views (Iso, Top, Front, Right) in the top right to align camera angles.',
    },
    {
      title: 'Drawing 2D Shapes on Surfaces',
      subtitle: 'Lines, Rectangles, Circles & Polygons',
      icon: Pencil,
      description: [
        'Click the Rectangle tool (R) or Line tool (L) in the left toolbar.',
        'Click once on the ground grid to set your starting corner or point.',
        'Move your mouse to adjust width and depth, then click again to create a selectable face.',
      ],
      shortcut: 'Press "R" for Rectangle, "L" for Line',
      tip: 'Lines that form a closed coplanar loop automatically create a 2D surface face!',
    },
    {
      title: 'Push / Pull 3D Extrusion',
      subtitle: 'The Magic of Turning Flat Shapes into 3D Solids',
      icon: ArrowUpFromLine,
      description: [
        'Select the Push/Pull tool (press "U" or click the icon in the left toolbar).',
        'Hover over any 2D face—it will highlight.',
        'Click and drag outward or inward along the face normal to extrude it into a 3D solid box or wall!',
      ],
      shortcut: 'Press "U" for Push/Pull',
      tip: 'Try extruding the sample "Push/Pull Work Face" right in your starter scene!',
    },
    {
      title: 'Exact Numerical Measurements',
      subtitle: 'Type Dimensions Directly in the Value Control Box',
      icon: Ruler,
      description: [
        'Whenever you are drawing, moving, or extruding, look at the Measurements Box at the bottom right.',
        'Simply start typing numbers on your keyboard (e.g., "2400" or "4000, 3000") and press Enter to set exact architectural dimensions!',
      ],
      shortcut: 'Type digits anytime to enter exact mm, cm, m, inches, or feet',
      tip: 'Switch project units (mm, cm, m, ft, in) seamlessly using the dropdown in the bottom bar.',
    },
    {
      title: 'Intelligent Snapping & Inference',
      subtitle: 'Endpoints, Midpoints & Colored Axis Locking',
      icon: MousePointer,
      description: [
        'Green Square = Snapping to an Endpoint vertex.',
        'Cyan Circle = Snapping to an Edge Midpoint.',
        'Magenta Circle = Snapping to a Face Center.',
        'Red & Green Dashed Guides = Aligned strictly along the X or Z world axes.',
      ],
      tip: 'Inference badges appear right beside your cursor so you always know what you are snapping to.',
    },
    {
      title: 'Gemini AI Design Assistant',
      subtitle: 'Natural-Language 3D Spatial Creation & Editing',
      icon: Sparkles,
      description: [
        'Click the Sparkles tab in the right panel to talk to Gemini.',
        'Ask Gemini to create entire rooms, adjust walls, add doors/windows, or arrange furniture:',
        '"Create a 6m x 8m open-plan living room with an L-shaped kitchen and a 2m island."',
      ],
      tip: 'Gemini outputs validated structured 3D operations that you can tweak or undo anytime!',
    },
    {
      title: 'Pages & 2D LayOut Sheets',
      subtitle: 'Multiple Floors, Design Variations & Architectural Blueprints',
      icon: FileText,
      description: [
        'Click "+ New Page" in the tab bar just below the top bar.',
        'Choose "3D Design Space" for a blank room, alternative design variation, or starter template.',
        'Choose "2D LayOut Blueprint Sheet" to generate scaled 2D floor plans with dimensions, title blocks, and bill of materials schedules!',
      ],
      tip: 'Double-click any page tab to rename it (e.g., "Ground Floor", "Upper Level", "Option B").',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const closeTour = () => {
    useModelStore.setState({ isTourOpen: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <currentStep.icon size={18} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">{currentStep.title}</h2>
              <p className="text-xs text-slate-400">{currentStep.subtitle}</p>
            </div>
          </div>
          <button
            onClick={closeTour}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-3.5 flex-1">
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {currentStep.description.map((line, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-sky-400 shrink-0 font-bold">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>

          {currentStep.shortcut && (
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400 font-medium">Shortcut:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700">
                {currentStep.shortcut}
              </kbd>
            </div>
          )}

          {currentStep.tip && (
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200 leading-snug">
              <span className="font-semibold text-sky-300">Pro Tip: </span>
              {currentStep.tip}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex ? 'w-5 bg-sky-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStepIndex((i) => i - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setCurrentStepIndex((i) => i + 1)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={closeTour}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Check size={14} />
                <span>Start Designing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
