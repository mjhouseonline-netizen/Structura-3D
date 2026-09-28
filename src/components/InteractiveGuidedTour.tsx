import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Home,
  ArrowRight,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';

interface TourStep {
  id: string;
  selector: string;
  title: string;
  explanation: string;
  preferredPlacement?: 'right' | 'bottom' | 'top' | 'left';
}

export const InteractiveGuidedTour: React.FC = () => {
  const { isTourOpen, tourStep, isTourWelcomeOpen, isHelpOpen, isInstructionsOpen } =
    useModelStore();

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // 18 Concise Steps connected to actual DOM elements
  const steps: TourStep[] = [
    {
      id: 'tab-3d-space',
      selector: '[data-tour="tab-3d-space"]',
      title: '3D Living Space',
      explanation: 'Your real-time 3D workspace where designs are created and viewed with natural lighting.',
      preferredPlacement: 'bottom',
    },
    {
      id: 'tab-2d-layout',
      selector: '[data-tour="tab-2d-layout"]',
      title: '2D LayOut Blueprint',
      explanation: 'Switch to a scaled architectural sheet with dimensions, area calculations, and schedules.',
      preferredPlacement: 'bottom',
    },
    {
      id: 'tool-orbit',
      selector: '[data-tour="tool-orbit"], [data-tour="tool-orbit-mobile"]',
      title: 'Orbit Camera',
      explanation: 'Rotate your view around the model. You can also drag with your Middle Mouse Wheel or Alt+Drag.',
      preferredPlacement: 'right',
    },
    {
      id: 'camera-views',
      selector: '[data-tour="camera-views"]',
      title: 'Camera Views',
      explanation: 'Quickly snap between Isometric 3D, Top floor plan, Front elevation, and Fit Extents.',
      preferredPlacement: 'bottom',
    },
    {
      id: 'tool-select',
      selector: '[data-tour="tool-select"], [data-tour="tool-select-mobile"]',
      title: 'Select Tool (Space / V)',
      explanation: 'Click objects or faces to select them before editing. Hold Shift to select multiple items.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-rectangle',
      selector: '[data-tour="tool-rectangle"], [data-tour="tool-rectangle-mobile"]',
      title: 'Drawing Tools (Rectangle & Line)',
      explanation: 'Click and drag to draw shapes. Closed coplanar loops automatically form editable 2D faces.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-pushpull',
      selector: '[data-tour="tool-pushpull"], [data-tour="tool-pushpull-mobile"]',
      title: 'Push / Pull Extrude (U)',
      explanation: 'Turn flat faces into 3D solids by pulling outward or pushing inward. Enter exact heights anytime.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-move',
      selector: '[data-tour="tool-move"]',
      title: 'Move Tool (M)',
      explanation: 'Move objects along the Red (X), Green (Z), or Blue (Y) axes with exact distance input.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-rotate',
      selector: '[data-tour="tool-rotate"]',
      title: 'Rotate Tool (Q)',
      explanation: 'Rotate objects around a pivot point with automatic 15° and 90° angle snapping.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-library',
      selector: '[data-tour="tool-library-mobile"], [data-tour="tool-library"], [data-tour="panel-tab-library"]',
      title: 'Component Library',
      explanation: 'Add realistic parametric furniture, doors, windows, and kitchen or bathroom fixtures.',
      preferredPlacement: 'right',
    },
    {
      id: 'tool-paint',
      selector: '[data-tour="tool-paint-mobile"], [data-tour="tool-paint"]',
      title: 'Paint Tool (B)',
      explanation: 'Click any surface or object to coat it with your active material or custom color.',
      preferredPlacement: 'right',
    },
    {
      id: 'panel-tab-materials',
      selector: '[data-tour="panel-tab-materials"], [data-tour="tool-paint-mobile"]',
      title: 'Materials Panel',
      explanation: 'Select from oak parquet, marble, ceramic tiles, linen fabrics, metal, or custom hex paints.',
      preferredPlacement: 'left',
    },
    {
      id: 'panel-tab-ai',
      selector: '[data-tour="panel-tab-ai-mobile"], [data-tour="panel-tab-ai"]',
      title: 'Gemini AI Assistant',
      explanation: 'Describe what you want in plain words (e.g. "Create a 4m x 5m room with oak flooring") and AI builds it.',
      preferredPlacement: 'left',
    },
    {
      id: 'panel-tab-properties',
      selector: '[data-tour="panel-tab-properties"]',
      title: 'Properties & Dimensions',
      explanation: 'Edit exact Width, Height, Depth, and position coordinates of selected items in millimeters.',
      preferredPlacement: 'left',
    },
    {
      id: 'vcb-measurements',
      selector: '[data-tour="vcb-measurements"]',
      title: 'Value Control Box (VCB)',
      explanation: 'Displays dimensions as you draw. Simply type exact numbers (e.g. 2400) and press Enter.',
      preferredPlacement: 'top',
    },
    {
      id: 'unit-selector',
      selector: '[data-tour="unit-selector"]',
      title: 'Unit Selector',
      explanation: 'Switch project measurement units between mm, cm, m, inches, and feet whenever needed.',
      preferredPlacement: 'top',
    },
    {
      id: 'undo-btn',
      selector: '[data-tour="undo-btn"]',
      title: 'Undo (Ctrl+Z) & Redo (Ctrl+Y)',
      explanation: 'Easily step backwards or forwards through your manual and AI design modifications.',
      preferredPlacement: 'bottom',
    },
    {
      id: 'export-btn',
      selector: '[data-tour="export-btn"]',
      title: 'Save & Export',
      explanation: 'Download your .structura.json project backup or export clean, high-resolution PNG renders.',
      preferredPlacement: 'bottom',
    },
  ];

  // First-time visit detection
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('structura_has_seen_tour');
      const dontShow = localStorage.getItem('structura_dont_show_tour');
      if (!hasSeen && !dontShow) {
        setWelcomeOpen(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // When tour is running, make sure all other popups, help modals, and drawers are closed!
  useEffect(() => {
    if (isTourOpen) {
      setWelcomeOpen(false);
      useModelStore.setState({
        isInstructionsOpen: false,
        isHelpOpen: false,
        isInteractiveTutorialActive: false,
        isMobileDrawerOpen: false,
        dismissEmptyWorkspacePrompt: true,
      });
    }
  }, [isTourOpen]);

  // Compute position of target element
  const currentStepIndex = Math.max(0, Math.min(steps.length - 1, tourStep - 1));
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isTourOpen) return;

    const updateRect = () => {
      const el = document.querySelector(currentStep.selector) as HTMLElement | null;
      if (el) {
        // Ensure element is visible
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updateRect, 50);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isTourOpen, tourStep, currentStepIndex]);

  const handleStartTour = () => {
    setWelcomeOpen(false);
    setIsFinished(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem('structura_dont_show_tour', 'true');
      } catch (e) {}
    }
    modelActions.startGuidedTour();
  };

  const handleSkipTour = () => {
    setWelcomeOpen(false);
    try {
      localStorage.setItem('structura_has_seen_tour', 'true');
      if (dontShowAgain) {
        localStorage.setItem('structura_dont_show_tour', 'true');
      }
    } catch (e) {}
  };

  const handleFinishTour = (startFirstRoom: boolean) => {
    modelActions.exitGuidedTour();
    setIsFinished(false);
    try {
      localStorage.setItem('structura_has_seen_tour', 'true');
    } catch (e) {}

    if (startFirstRoom) {
      modelActions.startInteractiveTutorial();
    }
  };

  const handleNext = () => {
    if (tourStep >= steps.length) {
      setIsFinished(true);
    } else {
      modelActions.nextTourStep();
    }
  };

  const handlePrev = () => {
    if (isFinished) {
      setIsFinished(false);
    } else {
      modelActions.prevTourStep();
    }
  };

  // If Help is open, NEVER show tour welcome or tour cards
  if (isHelpOpen || isInstructionsOpen) {
    return null;
  }

  // 1. FIRST-TIME WELCOME POPUP
  if (welcomeOpen || isTourWelcomeOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
        <div className="bg-slate-900 border border-slate-700 max-w-sm sm:max-w-md w-full rounded-2xl shadow-2xl p-5 text-slate-200 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-sky-500/25 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Welcome to your 3D Design Studio
              </h3>
              <p className="text-xs text-slate-400">
                Let's take a quick tour so you know exactly how to create, edit and navigate your designs.
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="dontShowTourCheckbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="dontShowTourCheckbox"
              className="text-xs text-slate-400 cursor-pointer select-none"
            >
              Don't show automatically again
            </label>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleSkipTour}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Skip Tour
            </button>

            <button
              onClick={handleStartTour}
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/25 transition-all"
            >
              <span>Start Tour</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If tour is not active, render nothing
  if (!isTourOpen) return null;

  // 2. FINISH TOUR POPUP
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
        <div className="bg-slate-900 border border-slate-700 max-w-sm sm:max-w-md w-full rounded-2xl shadow-2xl p-5 text-slate-200 space-y-3.5 text-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <h3 className="font-bold text-white text-base">You’re ready to start designing.</h3>
            <p className="text-xs text-slate-400 mt-1">
              You can replay this tour anytime from <strong>Help → Take the Guided Tour</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => handleFinishTour(false)}
              className="w-full sm:w-1/2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Start Designing
            </button>

            <button
              onClick={() => handleFinishTour(true)}
              className="w-full sm:w-1/2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25 transition-all"
            >
              <Home size={14} />
              <span>Build My First Room</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. CONTEXTUAL TOOLTIP CARD POSITIONING
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const padding = 10;
  const cardWidth = isMobile ? Math.min(290, window.innerWidth - 24) : 280;

  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    width: `${cardWidth}px`,
  };

  if (targetRect) {
    if (isMobile) {
      // Mobile positioning: Place strictly ABOVE or BELOW the control, never overlapping it!
      const isNearTop = targetRect.top < 160;
      const isNearBottom = targetRect.bottom > window.innerHeight - 160;

      let topVal: number | undefined;
      let bottomVal: number | undefined;

      if (isNearTop) {
        topVal = Math.min(window.innerHeight - 170, targetRect.bottom + padding);
      } else if (isNearBottom) {
        bottomVal = Math.min(window.innerHeight - 170, window.innerHeight - targetRect.top + padding);
      } else {
        // Default place below control
        topVal = targetRect.bottom + padding;
      }

      // Horizontal clamp: center relative to target or screen
      const centerX = targetRect.left + targetRect.width / 2;
      const leftVal = Math.max(
        padding,
        Math.min(window.innerWidth - cardWidth - padding, centerX - cardWidth / 2)
      );

      cardStyle.left = `${leftVal}px`;
      if (bottomVal !== undefined) {
        cardStyle.bottom = `${bottomVal}px`;
      } else {
        cardStyle.top = `${topVal}px`;
      }
    } else {
      // Desktop positioning: Place beside control (right, left, bottom, or top)
      let placement = currentStep.preferredPlacement || 'right';

      const spaceRight = window.innerWidth - targetRect.right;
      const spaceLeft = targetRect.left;
      const spaceBottom = window.innerHeight - targetRect.bottom;
      const spaceTop = targetRect.top;

      if (placement === 'right' && spaceRight < cardWidth + padding) {
        placement = spaceLeft > cardWidth + padding ? 'left' : 'bottom';
      } else if (placement === 'left' && spaceLeft < cardWidth + padding) {
        placement = spaceRight > cardWidth + padding ? 'right' : 'bottom';
      } else if (placement === 'bottom' && spaceBottom < 170 + padding) {
        placement = spaceTop > 170 + padding ? 'top' : 'bottom';
      }

      if (placement === 'right') {
        cardStyle.left = `${targetRect.right + padding}px`;
        cardStyle.top = `${Math.max(padding, Math.min(window.innerHeight - 180, targetRect.top))}px`;
      } else if (placement === 'left') {
        cardStyle.left = `${Math.max(padding, targetRect.left - cardWidth - padding)}px`;
        cardStyle.top = `${Math.max(padding, Math.min(window.innerHeight - 180, targetRect.top))}px`;
      } else if (placement === 'top') {
        const left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, targetRect.left));
        cardStyle.left = `${left}px`;
        cardStyle.bottom = `${window.innerHeight - targetRect.top + padding}px`;
      } else {
        // bottom
        const left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, targetRect.left));
        cardStyle.left = `${left}px`;
        cardStyle.top = `${targetRect.bottom + padding}px`;
      }
    }
  } else {
    // Fallback centered
    cardStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 50,
      width: `${cardWidth}px`,
    };
  }

  return (
    <>
      {/* Light spotlight dimming overlay with cutout around target element */}
      <div className="fixed inset-0 z-40 pointer-events-none transition-all duration-150">
        {targetRect ? (
          <div
            className="absolute rounded-lg transition-all duration-150"
            style={{
              top: `${Math.max(0, targetRect.top - 4)}px`,
              left: `${Math.max(0, targetRect.left - 4)}px`,
              width: `${targetRect.width + 8}px`,
              height: `${targetRect.height + 8}px`,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 12px rgba(56, 189, 248, 0.9)',
              border: '2px solid rgba(56, 189, 248, 0.95)',
            }}
          />
        ) : (
          <div className="fixed inset-0 bg-slate-950/50" />
        )}
      </div>

      {/* Small Contextual Tour Card: Step X of 18, Name, Explanation, Back, Next, Close */}
      <div
        style={cardStyle}
        className="bg-slate-900/98 border border-sky-500/90 rounded-xl p-3 shadow-2xl backdrop-blur-xl text-slate-200 animate-in fade-in duration-150 select-none space-y-2"
      >
        {/* Header: Step X of 18 + Close Button */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
            Step {tourStep} of {steps.length}
          </span>
          <button
            onClick={() => modelActions.exitGuidedTour()}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title="Close Tour"
          >
            <X size={14} />
          </button>
        </div>

        {/* Feature Name */}
        <h4 className="font-bold text-white text-xs leading-tight">{currentStep.title}</h4>

        {/* Short, Concise Explanation */}
        <p className="text-slate-300 text-[11px] leading-relaxed">{currentStep.explanation}</p>

        {/* Footer: Back & Next Buttons */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={tourStep === 1}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-[11px] font-medium flex items-center gap-0.5 transition-colors"
          >
            <ChevronLeft size={13} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
          >
            <span>{tourStep === steps.length ? 'Finish' : 'Next'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </>
  );
};
