import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../../lib/soundFx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

let activeModals = 0;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      activeModals++;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (isOpen) {
        activeModals--;
        if (activeModals <= 0) {
          activeModals = 0;
          document.body.style.overflow = 'unset';
        }
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with rich blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg transition-opacity"
        onClick={() => {
          soundFx.playClick();
          onClose();
        }}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} glass-card bg-white dark:bg-[#2B2D31] rounded-3xl shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#3F4147] bg-slate-50/70 dark:bg-[#1E1F22] gap-4">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#383A40] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto text-slate-800 dark:text-[#DBDEE1]">{children}</div>
      </div>
    </div>
  );
};
