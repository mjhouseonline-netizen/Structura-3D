import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ContextHelpProps {
  title: string;
  description: string;
  tip?: string;
  shortcut?: string;
  className?: string;
}

export const ContextHelpTooltip: React.FC<ContextHelpProps> = ({
  title,
  description,
  tip,
  shortcut,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-sky-300 transition-colors p-0.5 rounded-full hover:bg-slate-800"
        title={`Help: ${title}`}
      >
        <HelpCircle size={13} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-3 text-xs text-slate-200 animate-in fade-in duration-150 select-text"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
            <span className="font-semibold text-sky-400 text-xs">{title}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">{description}</p>
          {shortcut && (
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono border border-slate-700">
                {shortcut}
              </kbd>
            </div>
          )}
          {tip && (
            <div className="mt-2 text-[10px] text-sky-300 bg-sky-950/40 border border-sky-800/40 rounded p-1.5 leading-snug">
              <strong>Tip:</strong> {tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
