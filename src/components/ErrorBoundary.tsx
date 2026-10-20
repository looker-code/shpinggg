import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.removeItem('enablepay_accounts_v1');
      localStorage.removeItem('promissory_pay_accounts_v4');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0E12] text-white flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-[#161821] border border-[#262936] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF453A] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">Ops, algo inesperado ocorreu</h2>
              <p className="text-xs text-[#8B95A5] mt-1.5">
                O aplicativo detectou uma falha e foi contido com segurança para proteger seus dados.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#12141A] rounded-xl border border-[#262936] text-[11px] font-mono text-[#FF9500] text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full bg-[#1E212D] hover:bg-[#262936] text-[#8B95A5] hover:text-white font-bold text-xs py-3 px-4 rounded-xl border border-[#262936] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
