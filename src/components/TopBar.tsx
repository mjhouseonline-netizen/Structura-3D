import React, { useRef } from 'react';
import {
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Camera,
  Download,
  Eye,
  Sun,
  Moon,
  HelpCircle,
  BookOpen,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  Sparkles,
  Keyboard,
  Home,
} from 'lucide-react';
import { useModelStore, modelActions, serializeProject } from '../state/useModelStore';
import { isOfflineDesktop } from '../offline';

export const TopBar: React.FC = () => {
  const {
    project,
    historyIndex,
    history,
    selectedObjectIds,
    presentationMode,
    theme,
    saveStatus,
  } = useModelStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isViewsOpen, setIsViewsOpen] = React.useState(false);
  const [isHelpOpenMenu, setIsHelpOpenMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedObjectIds.length > 0;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(
      serializeProject(),
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}.structura.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const handleExportImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_render.png`;
    link.click();
    setIsExportOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        modelActions.loadProject(json);
      } catch (err) {
        alert('Invalid Structura 3D project file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerCameraAction = (viewName: string) => {
    window.dispatchEvent(new CustomEvent('structura_camera_action', { detail: { view: viewName } }));
    setIsViewsOpen(false);
  };

  return (
    <header className="h-13 bg-slate-900 border-b border-slate-800 text-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
            S
          </div>
          <span className="font-semibold text-white tracking-tight hidden sm:inline">
            Structura<span className="text-sky-400">3D</span>
            {isOfflineDesktop && <span className="ml-2 text-xs text-emerald-400">Offline</span>}
          </span>
        </div>

        <div className="h-5 w-[1px] bg-slate-700/60 hidden sm:block mx-1" />

        {/* Editable Project Name */}
        <input
          type="text"
          value={project.name}
          onChange={(e) =>
            useModelStore.setState((prev) => ({
              project: { ...prev.project, name: e.target.value, updatedAt: new Date().toISOString() },
            }))
          }
          className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 px-2 py-1 rounded text-sm text-slate-300 font-medium focus:text-white border border-transparent focus:border-slate-700 outline-none max-w-[200px] truncate"
          title="Click to rename project"
        />

        {/* Autosave Status */}
        <span className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5 ml-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'saved'
                ? 'bg-emerald-400'
                : saveStatus === 'saving'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
        </span>
      </div>

      {/* Middle Operations: New, Open, Undo, Redo, Duplicate, Delete */}
      <div className="flex items-center gap-1">
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => modelActions.resetScene()}
            title="New Project (Blank)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Plus size={18} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Open Project (JSON)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <FolderOpen size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />

          <button
            data-tour="save-btn"
            onClick={handleExportJson}
            title="Save / Download Project (.json)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Save size={18} />
          </button>

          <div className="h-5 w-[1px] bg-slate-700/60 mx-1" />
        </div>

        <button
          data-tour="undo-btn"
          onClick={() => modelActions.undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
        >
          <Undo2 size={18} />
        </button>

        <button
          data-tour="redo-btn"
          onClick={() => modelActions.redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
        >
          <Redo2 size={18} />
        </button>

        <div className="hidden md:flex items-center gap-1">
          <div className="h-5 w-[1px] bg-slate-700/60 mx-1" />

          <button
            onClick={() => modelActions.duplicateSelected()}
            disabled={!hasSelection}
            title="Duplicate Selected (Ctrl+D)"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
          >
            <Copy size={18} />
          </button>

          <button
            onClick={() => modelActions.deleteSelected()}
            disabled={!hasSelection}
            title="Delete Selected (Del / Backspace)"
            className="p-1.5 rounded hover:bg-red-500/20 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Right Controls: Desktop full toolbar + Mobile compact menu */}
      <div className="flex items-center gap-1.5">
        {/* Camera Views Menu (Desktop) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsViewsOpen(!isViewsOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">Views</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {isViewsOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
              <button
                onClick={() => triggerCameraAction('iso')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Isometric 3D
              </button>
              <button
                onClick={() => triggerCameraAction('top')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Top (Floor Plan)
              </button>
              <button
                onClick={() => triggerCameraAction('front')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Front Elevation
              </button>
              <button
                onClick={() => triggerCameraAction('back')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Back Elevation
              </button>
              <button
                onClick={() => triggerCameraAction('left')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Left View
              </button>
              <button
                onClick={() => triggerCameraAction('right')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                Right View
              </button>
            </div>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            data-tour="export-btn"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={13} className="text-sky-200" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
              <button
                onClick={handleExportImage}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Image (PNG)</span>
                <span className="text-[10px] text-slate-500">HD Render</span>
              </button>
              <button
                onClick={handleExportJson}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Project File</span>
                <span className="text-[10px] text-slate-500">.json</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop-only secondary buttons */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="h-5 w-[1px] bg-slate-700/60 mx-0.5" />

          {/* Presentation Mode Toggle */}
          <button
            onClick={() =>
              useModelStore.setState((prev) => ({ presentationMode: !prev.presentationMode }))
            }
            title={presentationMode ? 'Exit Presentation Mode' : 'Presentation Mode (Hide UI)'}
            className={`p-1.5 rounded transition-colors ${
              presentationMode
                ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Eye size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() =>
              useModelStore.setState((prev) => ({
                theme: prev.theme === 'dark' ? 'light' : 'dark',
              }))
            }
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Help & Learning Center Dropdown */}
          <div className="relative">
            <button
              data-tour="help-btn"
              onClick={() => setIsHelpOpenMenu(!isHelpOpenMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20"
              title="Help & Learning System"
            >
              <HelpCircle size={14} />
              <span>Help</span>
              <ChevronDown size={13} className="text-sky-200" />
            </button>

            {isHelpOpenMenu && (
              <div
                className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 space-y-0.5"
                onMouseLeave={() => setIsHelpOpenMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Learning & Guidance
                </div>

                <button
                  onClick={() => {
                    modelActions.startGuidedTour();
                    setIsHelpOpenMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sky-300 hover:text-white flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Sparkles size={15} className="text-sky-400" />
                  <span>Take the Guided Tour</span>
                </button>

                <button
                  onClick={() => {
                    modelActions.startInteractiveTutorial();
                    setIsHelpOpenMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Home size={15} className="text-emerald-400" />
                  <span>Build My First Room</span>
                </button>

                <div className="h-[1px] bg-slate-800 my-1" />

                <button
                  onClick={() => {
                    modelActions.openHelpSection('getting-started');
                    setIsHelpOpenMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <BookOpen size={15} className="text-indigo-400" />
                  <span>How to Use the App</span>
                </button>

                <button
                  onClick={() => {
                    modelActions.openHelpSection('shortcuts');
                    setIsHelpOpenMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Keyboard size={15} className="text-amber-400" />
                  <span>Keyboard & Mouse Controls</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="More Options"
          >
            <Menu size={18} />
          </button>

          {isMobileMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200 space-y-1"
              onMouseLeave={() => setIsMobileMenuOpen(false)}
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Menu & Settings
              </div>

              <button
                onClick={() => {
                  modelActions.startGuidedTour();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-sky-300 font-medium"
              >
                <Sparkles size={14} className="text-sky-400" />
                <span>Take the Guided Tour</span>
              </button>

              <button
                onClick={() => {
                  modelActions.startInteractiveTutorial();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Home size={14} className="text-emerald-400" />
                <span>Build My First Room</span>
              </button>

              <button
                onClick={() => {
                  modelActions.openHelpSection('getting-started');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <BookOpen size={14} className="text-indigo-400" />
                <span>How to Use the App</span>
              </button>

              <button
                onClick={() => {
                  modelActions.openHelpSection('shortcuts');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Keyboard size={14} className="text-amber-400" />
                <span>Keyboard & Mouse Controls</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-1" />

              <button
                onClick={() => {
                  triggerCameraAction('iso');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
              >
                <Camera size={14} />
                <span>Isometric View</span>
              </button>

              <button
                onClick={() => {
                  triggerCameraAction('top');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
              >
                <Camera size={14} />
                <span>Floor Plan View</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-1" />

              <button
                onClick={() => {
                  useModelStore.setState((prev) => ({
                    theme: prev.theme === 'dark' ? 'light' : 'dark',
                  }));
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>

              <button
                onClick={() => {
                  useModelStore.setState((prev) => ({ presentationMode: !prev.presentationMode }));
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
              >
                <Eye size={14} />
                <span>Presentation Mode</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
