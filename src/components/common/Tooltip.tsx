import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    isFlipped: boolean;
    arrowLeftOffset: number;
  }>({
    top: 0,
    left: 0,
    isFlipped: false,
    arrowLeftOffset: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipHalfWidth = Math.min(160, viewportWidth * 0.45);

      // Vertical flip detection (if element is too close to top edge, flip downwards)
      const isFlipped = rect.top < 150;
      const targetTop = isFlipped ? rect.bottom + 8 : rect.top - 8;

      // Horizontal clamp to keep tooltip inside viewport with 16px safety margin
      const rawLeft = rect.left + rect.width / 2;
      const clampedLeft = Math.max(
        tooltipHalfWidth + 16,
        Math.min(viewportWidth - tooltipHalfWidth - 16, rawLeft)
      );
      const arrowLeftOffset = rawLeft - clampedLeft;

      setPosition({
        top: targetTop,
        left: clampedLeft,
        isFlipped,
        arrowLeftOffset,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      // Listen to scroll events on any scrollable container to keep position in sync
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  // Close on Escape or click outside
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

  // React Portal rendering into document.body to break free from any overflow:hidden containers
  const tooltipPortal = isVisible
    ? createPortal(
        <div
          className={`fixed z-[99999] pointer-events-none transform -translate-x-1/2 ${
            position.isFlipped ? '' : '-translate-y-full'
          }`}
          style={{ top: position.top, left: position.left }}
        >
          <div className="w-72 sm:w-80 p-3.5 bg-slate-900/95 dark:bg-[#1E1F22]/98 text-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] border border-slate-700/80 dark:border-[#3F4147] text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            {title && (
              <div className="font-black text-blue-400 dark:text-[#0984E3] mb-1.5 flex items-center gap-1.5 border-b border-slate-700/60 dark:border-[#3F4147] pb-1 text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{title}</span>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-slate-200 dark:text-[#DBDEE1] whitespace-pre-wrap">
              {content}
            </p>

            {/* Dynamic Arrow Indicator */}
            {position.isFlipped ? (
              <div
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-[-1px] border-4 border-transparent border-b-slate-900 dark:border-b-[#1E1F22]"
                style={{ marginLeft: `${position.arrowLeftOffset}px` }}
              />
            ) : (
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-[#1E1F22]"
                style={{ marginLeft: `${position.arrowLeftOffset}px` }}
              />
            )}
          </div>
        </div>,
        document.body
      )
    : null;

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

      {tooltipPortal}
    </div>
  );
};
