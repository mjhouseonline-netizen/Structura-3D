import React, { useState } from 'react';
import {
  Boxes,
  FileText,
  Plus,
  X,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';

export const PageTabBar: React.FC = () => {
  const { pages, activePageId, presentationMode } = useModelStore();
  const [isNewPageMenuOpen, setIsNewPageMenuOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [pageMenuOpenId, setPageMenuOpenId] = useState<string | null>(null);

  if (presentationMode) return null;

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingPageId(id);
    setEditTitle(currentTitle);
    setPageMenuOpenId(null);
  };

  const handleCommitRename = (id: string) => {
    if (editTitle.trim()) {
      modelActions.renamePage(id, editTitle.trim());
    }
    setEditingPageId(null);
  };

  return (
    <div className="h-8.5 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between select-none z-20 text-xs">
      {/* Scrollable Page Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
          Pages:
        </span>

        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const is2D = page.type === '2d-layout';

          return (
            <div
              key={page.id}
              data-tour={is2D ? 'tab-2d-layout' : 'tab-3d-space'}
              className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer border ${
                isActive
                  ? 'bg-slate-800 text-sky-300 border-slate-700 font-medium shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
              }`}
              onClick={() => modelActions.switchPage(page.id)}
            >
              {is2D ? (
                <FileText size={13} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
              ) : (
                <Boxes size={13} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
              )}

              {editingPageId === page.id ? (
                <input
                  type="text"
                  value={editTitle}
                  autoFocus
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleCommitRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitRename(page.id);
                    if (e.key === 'Escape') setEditingPageId(null);
                  }}
                  className="bg-slate-950 px-1 py-0.5 rounded text-white border border-sky-500 outline-none w-28 text-xs font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleStartRename(page.id, page.title);
                  }}
                  className="max-w-[140px] truncate"
                  title="Double-click to rename"
                >
                  {page.title}
                </span>
              )}

              {/* Page menu trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPageMenuOpenId(pageMenuOpenId === page.id ? null : page.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-opacity ml-0.5"
                title="Page Options"
              >
                <MoreVertical size={11} />
              </button>

              {/* Close page (if more than 1 page exists) */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    modelActions.deletePage(page.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-opacity"
                  title="Delete Page"
                >
                  <X size={11} />
                </button>
              )}

              {/* Dropdown Menu for Individual Page */}
              {pageMenuOpenId === page.id && (
                <div
                  className="absolute left-0 top-full mt-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs text-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartRename(page.id, page.title)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit2 size={12} className="text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      modelActions.duplicatePage(page.id);
                      setPageMenuOpenId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Copy size={12} className="text-slate-400" />
                    <span>Duplicate</span>
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={() => {
                        modelActions.deletePage(page.id);
                        setPageMenuOpenId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* "+ New Page" Button with Dropdown Modal */}
        <div className="relative">
          <button
            onClick={() => setIsNewPageMenuOpen(!isNewPageMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-300 hover:text-white transition-colors ml-1 font-medium"
            title="Create a New 3D Space or 2D LayOut Sheet"
          >
            <Plus size={13} className="text-sky-400" />
            <span className="hidden sm:inline">New Page</span>
            <ChevronDown size={11} className="text-slate-500" />
          </button>

          {isNewPageMenuOpen && (
            <div
              className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1"
              onMouseLeave={() => setIsNewPageMenuOpen(false)}
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Create New Page / Sheet
              </div>

              {/* Option 1: Blank 3D Space */}
              <button
                onClick={() => {
                  modelActions.createPage('New 3D Space', '3d-space', 'blank');
                  setIsNewPageMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-start gap-2.5 text-slate-200"
              >
                <div className="p-1 rounded bg-sky-500/20 text-sky-400 mt-0.5">
                  <Boxes size={14} />
                </div>
                <div>
                  <div className="font-semibold text-white">3D Design Space (Blank)</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Start a fresh, clean 3D room or object model.
                  </div>
                </div>
              </button>

              {/* Option 2: Duplicate Current 3D Space */}
              <button
                onClick={() => {
                  modelActions.createPage('Design Variation B', '3d-space', 'copy');
                  setIsNewPageMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-start gap-2.5 text-slate-200"
              >
                <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <Copy size={14} />
                </div>
                <div>
                  <div className="font-semibold text-white">Duplicate Current Model</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Create an alternate option without changing your original.
                  </div>
                </div>
              </button>

              {/* Option 3: 2D Architectural LayOut Sheet */}
              <button
                onClick={() => {
                  modelActions.createPage('Architectural LayOut Plan', '2d-layout');
                  setIsNewPageMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-start gap-2.5 text-slate-200 border-t border-slate-800/80 pt-2"
              >
                <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="font-semibold text-white">2D LayOut Blueprint Sheet</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    SketchUp LayOut-style 2D floor plan with dimensions & BOM.
                  </div>
                </div>
              </button>

              {/* Option 4: Starter Templates */}
              <div className="border-t border-slate-800 pt-1.5 px-2">
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                  Or load a starter template:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      modelActions.createPage('Modern Kitchen', '3d-space', 'kitchen');
                      setIsNewPageMenuOpen(false);
                    }}
                    className="flex-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium text-center"
                  >
                    Kitchen
                  </button>
                  <button
                    onClick={() => {
                      modelActions.createPage('Studio Apartment', '3d-space', 'studio');
                      setIsNewPageMenuOpen(false);
                    }}
                    className="flex-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium text-center"
                  >
                    Studio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Indicator: Active Page Mode */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
        <span className="font-mono text-slate-500">
          Page {pages.findIndex((p) => p.id === activePageId) + 1} of {pages.length}
        </span>
      </div>
    </div>
  );
};
