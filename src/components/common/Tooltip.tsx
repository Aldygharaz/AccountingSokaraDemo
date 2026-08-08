import React, { useState, useEffect, useRef } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  children,
  iconOnly = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip on click outside or escape key
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible((prev) => !prev);
      }}
    >
      {children}

      {iconOnly && (
        <span
          className="p-0.5 rounded-full text-slate-400 hover:text-blue-600 dark:hover:text-[#0984E3] transition-colors ml-1 inline-flex items-center"
          title={title || 'Informasi bantuan'}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </span>
      )}

      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 bg-slate-900/95 dark:bg-[#1E1F22]/98 text-white rounded-2xl shadow-2xl border border-slate-700/80 dark:border-[#3F4147] z-[120] text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none">
          {title && (
            <div className="font-black text-blue-400 dark:text-[#0984E3] mb-1 flex items-center gap-1.5 border-b border-slate-700/60 pb-1 text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{title}</span>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-200 dark:text-[#DBDEE1]">
            {content}
          </p>
          {/* Bottom Arrow Indicator */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-[#1E1F22]" />
        </div>
      )}
    </div>
  );
};
