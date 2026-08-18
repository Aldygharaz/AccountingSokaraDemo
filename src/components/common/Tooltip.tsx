import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info, HelpCircle, Command, BookOpen, Check, Copy } from 'lucide-react';

export interface TooltipProps {
  content: string | React.ReactNode;
  title?: string;
  badge?: string;
  formula?: string;
  shortcut?: string;
  referenceDoc?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
  onOpenManual?: (topicId?: string) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  badge,
  formula,
  shortcut,
  referenceDoc,
  placement = 'auto',
  children,
  iconOnly = false,
  className = '',
  onOpenManual,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    resolvedPlacement: 'top' | 'bottom' | 'left' | 'right';
    arrowOffset: number;
  }>({
    top: 0,
    left: 0,
    resolvedPlacement: 'top',
    arrowOffset: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!containerRef.current) return;
    const triggerRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Approximate or measured tooltip dimensions
    const tooltipWidth = 320;
    const tooltipHeight = formula ? 180 : 120;
    const gap = 10;

    let targetPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (placement === 'auto') {
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      targetPlacement = spaceAbove >= tooltipHeight + gap ? 'top' : (spaceBelow >= tooltipHeight + gap ? 'bottom' : 'top');
    } else {
      targetPlacement = placement;
    }

    let top = 0;
    let left = 0;
    let arrowOffset = 0;

    if (targetPlacement === 'top') {
      top = triggerRect.top - gap;
      const idealLeft = triggerRect.left + triggerRect.width / 2;
      const clampedLeft = Math.max(
        tooltipWidth / 2 + 16,
        Math.min(viewportWidth - tooltipWidth / 2 - 16, idealLeft)
      );
      left = clampedLeft;
      arrowOffset = idealLeft - clampedLeft;
    } else if (targetPlacement === 'bottom') {
      top = triggerRect.bottom + gap;
      const idealLeft = triggerRect.left + triggerRect.width / 2;
      const clampedLeft = Math.max(
        tooltipWidth / 2 + 16,
        Math.min(viewportWidth - tooltipWidth / 2 - 16, idealLeft)
      );
      left = clampedLeft;
      arrowOffset = idealLeft - clampedLeft;
    } else if (targetPlacement === 'left') {
      left = triggerRect.left - gap - tooltipWidth / 2;
      top = triggerRect.top + triggerRect.height / 2;
    } else if (targetPlacement === 'right') {
      left = triggerRect.right + gap + tooltipWidth / 2;
      top = triggerRect.top + triggerRect.height / 2;
    }

    setCoords({
      top,
      left,
      resolvedPlacement: targetPlacement,
      arrowOffset,
    });
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 180);
  };

  const handleCopyFormula = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (formula) {
      navigator.clipboard.writeText(formula);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
    }
    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVisible(false);
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const tooltipElement = isVisible ? (
    <div
      ref={tooltipRef}
      onMouseEnter={() => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      }}
      onMouseLeave={handleMouseLeave}
      className="fixed z-[99999] pointer-events-auto transform -translate-x-1/2"
      style={{
        top: coords.top,
        left: coords.left,
        transform: coords.resolvedPlacement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
      }}
    >
      <div className="w-80 sm:w-96 p-4 bg-slate-900/95 dark:bg-[#1E1F22]/98 text-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-slate-700/80 dark:border-[#3F4147] text-xs backdrop-blur-md transition-all">
        {/* Header bar */}
        {(title || badge || shortcut) && (
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 dark:border-[#3F4147] pb-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Info className="w-3.5 h-3.5 text-blue-400 dark:text-[#0984E3] shrink-0" />
              {title && <span className="font-black text-slate-100 dark:text-white truncate text-[11px] uppercase tracking-wider">{title}</span>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {badge && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] font-mono font-bold uppercase">
                  {badge}
                </span>
              )}
              {shortcut && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono font-bold flex items-center gap-0.5">
                  <Command className="w-2.5 h-2.5" />
                  {shortcut}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content body */}
        <div className="text-[11px] leading-relaxed text-slate-200 dark:text-[#DBDEE1]">
          {typeof content === 'string' ? <p className="whitespace-pre-wrap">{content}</p> : content}
        </div>

        {/* Formula block */}
        {formula && (
          <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 dark:bg-black/50 border border-slate-800 font-mono text-[10px] text-blue-300 flex items-start justify-between gap-2">
            <div className="space-y-0.5 break-all">
              <span className="text-[9px] uppercase font-bold text-slate-500 block font-sans">Formula Akuntansi:</span>
              <span className="text-slate-200">{formula}</span>
            </div>
            <button
              onClick={handleCopyFormula}
              type="button"
              className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
              title="Salin Formula"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Reference / Footer action */}
        {referenceDoc && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <BookOpen className="w-3 h-3 text-blue-400" />
              SOP: {referenceDoc}
            </span>
            {onOpenManual && (
              <button
                type="button"
                onClick={() => onOpenManual(referenceDoc)}
                className="text-blue-400 hover:underline font-bold"
              >
                Buka Panduan &rarr;
              </button>
            )}
          </div>
        )}

        {/* Arrow Pointer */}
        {coords.resolvedPlacement === 'top' ? (
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900 dark:border-t-[#1E1F22]"
            style={{ marginLeft: `${coords.arrowOffset}px` }}
          />
        ) : (
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-slate-900 dark:border-b-[#1E1F22]"
            style={{ marginLeft: `${coords.arrowOffset}px` }}
          />
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        calculatePosition();
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

      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </div>
  );
};
