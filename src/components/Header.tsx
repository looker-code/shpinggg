import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard,
  Plus, 
  LogOut, 
  Bell,
  User,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../utils/auth';

interface HeaderProps {
  activeTab: 'inicio' | 'a-pagar';
  onTabChange: (tab: 'inicio' | 'a-pagar') => void;
  onOpenNewAccount: () => void;
  onOpenPaymentModal: () => void;
  onLogout: () => void;
  pendingCount: number;
  overdueCount: number;
  currentUser?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewAccount,
  onOpenPaymentModal,
  onLogout,
  pendingCount,
  overdueCount,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0D0E12]/95 backdrop-blur-md border-b border-[#262936]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo Brand EnablePay */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#11C76F] flex items-center justify-center shadow-[0_2px_12px_rgba(17,199,111,0.25)]">
              <span className="text-[#0D0E12] font-black text-lg tracking-tighter">E</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Enable<span className="text-[#11C76F]">Pay</span>
                </span>
                <span className="text-[10px] font-bold text-[#11C76F] bg-[#11C76F]/10 px-2 py-0.5 rounded-full border border-[#11C76F]/20">
                  Pro
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (PicPay Segment Bar) */}
          <nav className="flex items-center bg-[#161821] p-1 rounded-2xl border border-[#262936]">
            <button
              onClick={() => onTabChange('inicio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-[#11C76F] text-[#0D0E12] shadow-sm font-extrabold'
                  : 'text-[#8B95A5] hover:text-white hover:bg-[#1E212D]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => onTabChange('a-pagar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'a-pagar'
                  ? 'bg-[#11C76F] text-[#0D0E12] shadow-sm font-extrabold'
                  : 'text-[#8B95A5] hover:text-white hover:bg-[#1E212D]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>A Pagar</span>
              {(pendingCount > 0 || overdueCount > 0) && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    activeTab === 'a-pagar'
                      ? 'bg-[#0D0E12] text-[#11C76F]'
                      : overdueCount > 0
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-[#11C76F]/20 text-[#11C76F]'
                  }`}
                >
                  {overdueCount > 0 ? `${overdueCount} venc.` : pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenPaymentModal}
              className="bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-[0_2px_12px_rgba(17,199,111,0.25)] flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              title="Adicionar valor de pagamento"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar Pagamento</span>
              <span className="sm:hidden">Pagar</span>
            </button>

            <button
              onClick={onOpenNewAccount}
              className="bg-[#1E212D] hover:bg-[#262936] text-white font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#262936] flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              title="Cadastrar nova conta ou promissória"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nova Conta</span>
              <span className="sm:hidden">Conta</span>
            </button>

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#262936]">
              <div 
                className="w-8 h-8 rounded-full bg-[#11C76F]/15 border border-[#11C76F]/30 flex items-center justify-center text-xs font-black text-[#11C76F]"
                title={currentUser?.name || 'Administrador'}
              >
                {currentUser?.name 
                  ? currentUser.name.slice(0, 2).toUpperCase() 
                  : 'AD'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-bold text-white block truncate max-w-[130px]" title={currentUser?.name || 'Administrador'}>
                  {currentUser?.name || 'Administrador'}
                </span>
                <span className="text-[10px] text-[#11C76F] block truncate max-w-[130px]" title={currentUser?.businessType || 'EnablePay'}>
                  {currentUser?.businessType || 'Ativo'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sair da Conta"
                className="p-2 text-[#8B95A5] hover:text-[#FF453A] hover:bg-[#241318] rounded-xl transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
