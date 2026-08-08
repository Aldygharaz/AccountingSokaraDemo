import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import { resetToDefaultSeed } from '../../lib/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LedgerLogic Global ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRecover = () => {
    try {
      localStorage.clear();
      resetToDefaultSeed();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-[#1E1F22] border border-rose-500/30 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight">Terjadi Penyesuaian State Akuntansi</h2>
              <p className="text-xs text-slate-400 mt-2">
                Sistem mendeteksi inkonsistensi cache lokal atau perubahan schema buku besar.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleRecover}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pulihkan Database & Muat Ulang Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
