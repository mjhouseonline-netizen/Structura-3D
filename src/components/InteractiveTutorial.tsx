import React from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Wand2,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';

interface TutorialStepDef {
  step: number;
  title: string;
  actionHint: string;
  instruction: string;
  toolShortcut?: string;
  proTip?: string;
}

export const InteractiveTutorial: React.FC = () => {
  const { isInteractiveTutorialActive, tutorialCurrentStep, isTourOpen, isHelpOpen, isInstructionsOpen } =
    useModelStore();
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (!isInteractiveTutorialActive || isTourOpen || isHelpOpen || isInstructionsOpen) return null;

  const steps: TutorialStepDef[] = [
    {
      step: 1,
      title: 'Step 1: Start a Clean Workspace',
      actionHint: 'Click the "+" button in the top bar to create a fresh project',
      instruction:
        'Let’s build your first measured room from scratch! Start with an empty canvas so you have plenty of room to build.',
      toolShortcut: 'Top Bar: New Project (+)',
      proTip: 'Don’t worry about your current work—everything in your previous page is saved automatically.',
    },
    {
      step: 2,
      title: 'Step 2: Generate a 4m × 5m Room',
      actionHint: 'Select Room Tool (Shift+R), click the ground, and enter 4000, 5000',
      instruction:
        'Activate the Room Generator. Click anywhere on the ground grid, move your mouse, and type 4000, 5000 into your keyboard and press Enter.',
      toolShortcut: 'Press Shift + R (Room Tool)',
      proTip: 'Structura 3D automatically builds all 4 perimeter walls and the concrete floor slab together!',
    },
    {
      step: 3,
      title: 'Step 3: Set 2.4m Wall Heights',
      actionHint: 'Check wall dimensions in the Properties panel or bottom bar',
      instruction:
        'Notice your walls stand at 2400mm (2.4 metres)—standard ceiling height. You can select any wall with the Select tool (Space) to adjust its height or thickness anytime.',
      toolShortcut: 'Select Tool (Space / V)',
      proTip: '100mm to 150mm is standard architectural thickness for residential interior walls.',
    },
    {
      step: 4,
      title: 'Step 4: Place an Interior Door',
      actionHint: 'Open Component Library, click "Standard Interior Door (900mm)"',
      instruction:
        'In the right panel, click the Component Library (Package icon). Under Doors & Windows, select the 900mm Door and place it against the left wall.',
      toolShortcut: 'Right Panel: Component Library',
      proTip: 'When you view your 2D LayOut drawing sheet, doors automatically display an architectural 90° swing arc!',
    },
    {
      step: 5,
      title: 'Step 5: Place Two Daylight Windows',
      actionHint: 'Add two Panoramic Windows evenly across the back wall',
      instruction:
        'From the Component Library, click "Panoramic Window". Move it onto the back wall. Insert a second window on the other side of the back wall.',
      toolShortcut: 'Right Panel: Component Library',
      proTip: 'In the Properties panel, setting Position Y to 900mm sets a standard sill height from the floor.',
    },
    {
      step: 6,
      title: 'Step 6: Apply Parquet Oak Flooring',
      actionHint: 'Select the floor slab and apply Parquet Oak from Materials',
      instruction:
        'Click on the floor slab to select it. In the right panel, open the Materials (Palette) tab, find the Flooring category, and select "Parquet Herringbone Oak".',
      toolShortcut: 'Press B (Paint Tool) or Materials Tab',
      proTip: 'Structura 3D uses high-fidelity procedural PBR shaders that react naturally to directional sunlight.',
    },
    {
      step: 7,
      title: 'Step 7: Furnish with a 3-Seater Sofa',
      actionHint: 'Insert a 3-Seater Sofa from the Living Room category',
      instruction:
        'In the Component Library, click "Living Room" and select the "3-Seater Sofa". It will appear in your room facing inward.',
      toolShortcut: 'Component Library → Living Room',
      proTip: 'All library components are built to accurate real-world metric and imperial ergonomic dimensions.',
    },
    {
      step: 8,
      title: 'Step 8: Place a Timber Coffee Table',
      actionHint: 'Insert a Timber Coffee Table in front of the sofa',
      instruction:
        'From the Living Room library, click "Timber Coffee Table". It is placed into your room.',
      toolShortcut: 'Component Library → Living Room',
      proTip: 'Leave roughly 400mm to 500mm clearance between your sofa and coffee table for comfortable walking space.',
    },
    {
      step: 9,
      title: 'Step 9: Move the Furniture with Precision',
      actionHint: 'Select the table, choose Move (M), and align it with the sofa',
      instruction:
        'Select the coffee table and press M (Move tool). Drag along the Red or Green axis inference lines to position it centered in front of the sofa.',
      toolShortcut: 'Press M (Move Tool)',
      proTip: 'Watch for the colored inference lines (Red = Width, Green = Depth) to keep your furniture aligned.',
    },
    {
      step: 10,
      title: 'Step 10: Change Furniture Fabric or Finish',
      actionHint: 'Select the sofa and apply "Natural Linen" or a custom colour',
      instruction:
        'Select the sofa, go to the Materials tab, and pick "Natural Linen" or choose a custom colour using the color picker to personalize your interior aesthetic.',
      toolShortcut: 'Materials Tab or Paint Tool (B)',
      proTip: 'You can re-paint any object or wall anytime without remaking it.',
    },
    {
      step: 11,
      title: 'Step 11: Orbit & Explore in 3D',
      actionHint: 'Hold Middle Mouse Button or Alt+Drag to orbit around your room',
      instruction:
        'Practice your camera controls: drag with the Middle Mouse Button (or Alt + Left Drag) to orbit. Scroll to zoom in and examine the details of your finished room!',
      toolShortcut: 'Orbit: Middle Drag / O | Pan: Shift+Middle Drag / H',
      proTip: 'Click the "Iso", "Top", or "Front" buttons in the top-right of the canvas to snap to standard views.',
    },
    {
      step: 12,
      title: 'Step 12: Save & Backup Your Project',
      actionHint: 'Click the Save / Download button in the top project toolbar',
      instruction:
        'While Structura 3D automatically saves your work in browser storage, click the Save icon in the top toolbar to download a .structura.json file as your personal offline backup.',
      toolShortcut: 'Top Bar: Save Project (.json)',
      proTip: 'You can reload this file anytime using the Open Project (folder) button.',
    },
    {
      step: 13,
      title: 'Step 13: Export Your Render & 2D Blueprint',
      actionHint: 'Click Export → PNG for an image, or switch to the 2D LayOut tab',
      instruction:
        'Congratulations! Click Export → Image (PNG) for a high-res presentation render, or click "2D LayOut Blueprint" in the Pages bar to generate a professional construction drawing sheet with area calculations and bill of materials!',
      toolShortcut: 'Top Bar: Export → PNG / LayOut Tab',
      proTip: 'You have mastered the fundamentals of 3D spatial design in Structura 3D!',
    },
  ];

  const currentStepData = steps[tutorialCurrentStep - 1] || steps[0];
  const isFirst = tutorialCurrentStep === 1;
  const isLast = tutorialCurrentStep === steps.length;

  return (
    <div className="fixed bottom-14 left-4 z-40 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom duration-200 select-none">
      <div className="bg-slate-900/95 border-2 border-sky-500/80 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-200 overflow-hidden flex flex-col">
        {/* Tutorial Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-b border-sky-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="font-bold text-white text-xs block leading-tight">
                Build Your First Room Tutorial
              </span>
              <span className="text-[10px] text-sky-300 font-mono">
                Step {tutorialCurrentStep} of {steps.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title={isMinimized ? 'Expand Tutorial' : 'Minimize Tutorial'}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button
              onClick={() => modelActions.exitInteractiveTutorial()}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Exit Tutorial"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-sky-400 to-indigo-500 h-1 transition-all duration-300"
            style={{ width: `${(tutorialCurrentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Tutorial Content (Hidden if minimized) */}
        {!isMinimized && (
          <div className="p-4 space-y-3">
            <div>
              <h4 className="font-bold text-white text-sm leading-tight mb-1">
                {currentStepData.title}
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                {currentStepData.instruction}
              </p>
            </div>

            {/* Action Clue Pill */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-sky-300 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-sky-400 shrink-0" />
                <span>{currentStepData.actionHint}</span>
              </div>
              {currentStepData.toolShortcut && (
                <div className="text-[10px] text-slate-400 pl-4 font-mono">
                  {currentStepData.toolShortcut}
                </div>
              )}
            </div>

            {currentStepData.proTip && (
              <div className="text-[10px] text-slate-400 leading-snug pl-1">
                <strong className="text-slate-300">Pro Tip: </strong>
                {currentStepData.proTip}
              </div>
            )}

            {/* Quick Helper Button: "Auto-Complete this Step" */}
            <button
              onClick={() => {
                modelActions.executeTutorialStepAuto(tutorialCurrentStep);
                if (!isLast) modelActions.nextTutorialStep();
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-700/80 transition-colors"
              title="Let the app build this step for you so you can follow along"
            >
              <Wand2 size={12} />
              <span>✨ Click to Auto-Complete this Step for Me</span>
            </button>

            {/* Navigation Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => modelActions.prevTutorialStep()}
                disabled={isFirst}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>

              <div className="text-[11px] text-slate-500 font-mono">
                {tutorialCurrentStep} / {steps.length}
              </div>

              {!isLast ? (
                <button
                  onClick={() => modelActions.nextTutorialStep()}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-sky-500/25 transition-all"
                >
                  <span>Next Step</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => modelActions.exitInteractiveTutorial()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition-all"
                >
                  <span>Complete!</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
