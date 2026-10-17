import React from 'react';
import { 
  FileSpreadsheet, 
  LayoutDashboard, 
  BookOpenCheck, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'inicio' | 'a-pagar';
  onTabChange: (tab: 'inicio' | 'a-pagar') => void;
  onOpenNewAccount: () => void;
  onLogout: () => void;
  pendingCount: number;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewAccount,
  onLogout,
  pendingCount,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <FileSpreadsheet className="w-5 h-5 font-black text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                  Promissória<span className="text-emerald-400">Pay</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  TESOURARIA
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 -mt-0.5 hidden sm:block">
                Controle de Obrigações Financeiras & Amortizações
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-[#0e1424] p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => onTabChange('inicio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel Executivo</span>
            </button>

            <button
              onClick={() => onTabChange('a-pagar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'a-pagar'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Livro de Promissórias</span>
              {(pendingCount > 0 || overdueCount > 0) && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-mono font-black rounded-md ${
                    activeTab === 'a-pagar'
                      ? 'bg-slate-950 text-emerald-300'
                      : overdueCount > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {overdueCount > 0 ? `${overdueCount} em mora` : pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action Button & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenNewAccount}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Emitir Título</span>
              <span className="sm:hidden">+ Título</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={onLogout}
              title="Encerrar Sessão de Tesouraria"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-900/40"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Encerrar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
