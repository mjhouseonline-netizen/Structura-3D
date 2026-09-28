import React from 'react';
import { Sparkles, Pencil, Home, X, ArrowRight } from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';

export const EmptyWorkspaceHero: React.FC = () => {
  const { objects, isInteractiveTutorialActive, dismissEmptyWorkspacePrompt, presentationMode } =
    useModelStore();

  // Only show when the canvas is empty, tutorial is not running, and user hasn't dismissed it
  if (
    objects.length > 0 ||
    isInteractiveTutorialActive ||
    dismissEmptyWorkspacePrompt ||
    presentationMode
  ) {
    return null;
  }

  const handleStartDrawing = () => {
    modelActions.setTool('rectangle');
    useModelStore.setState({ dismissEmptyWorkspacePrompt: true });
  };

  const handleCreateWithAi = () => {
    useModelStore.setState({
      activeTab: 'ai',
      isMobileDrawerOpen: true,
      dismissEmptyWorkspacePrompt: true,
    });
  };

  const handleBuildFirstRoom = () => {
    modelActions.startInteractiveTutorial();
    useModelStore.setState({ dismissEmptyWorkspacePrompt: true });
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[92vw] max-w-md animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-slate-200 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
              S
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Welcome to Structura 3D
              </h3>
              <p className="text-xs text-slate-400">
                Your blank canvas is ready. How would you like to start?
              </p>
            </div>
          </div>

          <button
            onClick={() => useModelStore.setState({ dismissEmptyWorkspacePrompt: true })}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss Welcome Card"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {/* Choice 1: Build My First Room */}
          <button
            onClick={handleBuildFirstRoom}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-500/40 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/30">
                <Home size={17} />
              </div>
              <div>
                <span className="font-bold text-white text-xs block group-hover:text-sky-300 transition-colors">
                  Build My First Room
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Interactive 13-step guided beginner tutorial
                </span>
              </div>
            </div>
            <ArrowRight size={15} className="text-sky-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Choice 2: Start Drawing */}
          <button
            onClick={handleStartDrawing}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0">
                <Pencil size={17} />
              </div>
              <div>
                <span className="font-bold text-slate-200 text-xs block group-hover:text-white transition-colors">
                  Start Drawing
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Click and drag with Rectangle, Line, and Push/Pull
                </span>
              </div>
            </div>
            <ArrowRight size={15} className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Choice 3: Create With AI */}
          <button
            onClick={handleCreateWithAi}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={17} />
              </div>
              <div>
                <span className="font-bold text-slate-200 text-xs block group-hover:text-white transition-colors">
                  Create With AI
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Describe what you want in plain words
                </span>
              </div>
            </div>
            <ArrowRight size={15} className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
