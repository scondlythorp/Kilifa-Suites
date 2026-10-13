import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('[KILIFA SUITES ERROR BOUNDARY CAUGHT]', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public handleClearSession = () => {
    try {
      localStorage.removeItem('kilifa_auth_token');
      localStorage.removeItem('kilifa_active_user');
    } catch {}
    window.location.href = '/admin';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-[#0E1525] border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#C5A059]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block mb-1">
                Kilifa Suites Management
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                {this.props.fallbackTitle || 'Portal Display Recovery'}
              </h2>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                An unexpected view error was safely contained. Your session and account data remain secure.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left font-mono text-[11px] text-red-400 overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF66] text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reload Portal Interface
              </button>

              <button
                onClick={this.handleClearSession}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-mono transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Re-enter Admin Credentials
              </button>

              <a
                href="/"
                className="w-full py-2.5 px-4 rounded-xl text-white/50 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" /> Return to Public Website
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
