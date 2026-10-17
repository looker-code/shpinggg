import React from 'react';
import { 
  ReceiptText, 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusCircle, 
  LogOut, 
  UserCheck, 
  AlertCircle 
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Promissória<span className="text-emerald-600">Pay</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500 -mt-1 hidden sm:block">
                Controle de Promissórias & Contas a Pagar
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('inicio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => onTabChange('a-pagar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'a-pagar'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>A Pagar</span>
              {(pendingCount > 0 || overdueCount > 0) && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                    overdueCount > 0
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {overdueCount > 0 ? `${overdueCount} venc.` : pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action buttons & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenNewAccount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Conta</span>
              <span className="sm:hidden">Nova</span>
            </button>

            <div className="h-7 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Encerrar Sessão"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
