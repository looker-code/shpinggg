import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Plus, 
  CheckCheck, 
  FileText, 
  Trash2,
  ChevronDown
} from 'lucide-react';
import { DebtAccount } from '../types';
import { formatCurrency, calculateAccountFinancials } from '../utils/storage';

interface PromissoryCardProps {
  account: DebtAccount;
  onOpenPaymentModal: (account: DebtAccount) => void;
  onOpenDetailsModal: (account: DebtAccount) => void;
  onQuickSettle: (account: DebtAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const PromissoryCard: React.FC<PromissoryCardProps> = ({
  account,
  onOpenPaymentModal,
  onOpenDetailsModal,
  onQuickSettle,
  onDeleteAccount,
}) => {
  const {
    totalPaid,
    totalRemaining,
    progressPercent,
    paidInstallments,
    totalInstallments,
    computedStatus,
  } = calculateAccountFinancials(account);

  const isFullyPaid = computedStatus === 'quitado';

  const renderStatusBadge = () => {
    switch (computedStatus) {
      case 'quitado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Quitada
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">
            <Clock className="w-3.5 h-3.5" />
            Parcial ({progressPercent}%)
          </span>
        );
      case 'em_aberto':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#1E212D] text-[#8B95A5] border border-[#262936]">
            <Clock className="w-3.5 h-3.5 text-[#8B95A5]" />
            Em Aberto
          </span>
        );
    }
  };

  return (
    <div className={`relative bg-[#161821] rounded-3xl border transition-all duration-200 hover:border-[#11C76F]/40 flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] ${
      isFullyPaid 
        ? 'border-[#11C76F]/30 bg-[#161821]' 
        : 'border-[#262936]'
    }`}>
      {/* Top Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-[#262936]">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#1E212D] text-[#11C76F] border border-[#262936] px-2 py-0.5 rounded-lg">
              {account.code}
            </span>
            <span className="text-xs text-[#8B95A5]">
              {account.debts.length} {account.debts.length === 1 ? 'conta' : 'contas'}
            </span>
          </div>
          {renderStatusBadge()}
        </div>

        {/* Nome da Pessoa da Conta */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#11C76F]/10 text-[#11C76F] flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-white truncate">
            {account.debtorName}
          </h3>
        </div>

        {/* Resumo das contas adicionadas */}
        <div className="mt-2 text-xs text-[#8B95A5] space-y-0.5">
          {account.debts.slice(0, 2).map((d) => (
            <div key={d.id} className="flex items-center justify-between">
              <span className="truncate pr-2">• {d.name}</span>
              <span className="text-slate-300 font-semibold">{formatCurrency(d.amount)}</span>
            </div>
          ))}
          {account.debts.length > 2 && (
            <div className="text-[11px] text-[#11C76F]">
              + mais {account.debts.length - 2} {account.debts.length - 2 === 1 ? 'conta' : 'contas'}...
            </div>
          )}
        </div>
      </div>

      {/* Valores e Parcelas Section */}
      <div className="p-5 sm:p-6 py-4 bg-[#12141A] flex-1 flex flex-col justify-center space-y-3">
        {/* Três colunas de valor */}
        <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-[#262936]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block">
              Dívida Total
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white">
              {formatCurrency(account.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#11C76F] block">
              Já Pago
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#11C76F]">
              {formatCurrency(totalPaid)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block">
              Restante
            </span>
            <span className={`text-xs sm:text-sm font-extrabold ${
              isFullyPaid ? 'text-[#5F6876] line-through' : 'text-white'
            }`}>
              {formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>

        {/* Parcelas em Aberto & Progresso */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8B95A5] mb-1.5">
            <span>
              Parcelas: <strong className="text-white">{paidInstallments}/{totalInstallments} pagas</strong>
            </span>
            <span className={isFullyPaid ? 'text-[#11C76F] font-bold' : 'text-white font-bold'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#1E212D] h-2 rounded-full overflow-hidden border border-[#262936]">
            <div 
              className="h-full bg-[#11C76F] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Visualização Rápida das Parcelas (Chips de Parcelas) */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          {account.installments.map((inst) => {
            const isInstPaid = inst.status === 'pago';
            const isInstPartial = inst.status === 'parcial';
            return (
              <span
                key={inst.id}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  isInstPaid
                    ? 'bg-[#11C76F]/20 text-[#11C76F] border-[#11C76F]/30'
                    : isInstPartial
                    ? 'bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/30'
                    : 'bg-[#1E212D] text-[#8B95A5] border-[#262936]'
                }`}
                title={`Parcela ${inst.number}: ${formatCurrency(inst.originalAmount)} (Pago: ${formatCurrency(inst.paidAmount)})`}
              >
                P{inst.number}: {formatCurrency(inst.originalAmount)} {isInstPaid ? '✓' : ''}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-3 bg-[#161821] border-t border-[#262936] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isFullyPaid ? (
            <>
              <button
                onClick={() => onOpenPaymentModal(account)}
                className="bg-[#11C76F] hover:bg-[#0EAD60] active:scale-95 text-[#0D0E12] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Adicionar pagamento ou amortização nesta conta"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar Pagamento</span>
              </button>

              <button
                onClick={() => onQuickSettle(account)}
                className="bg-[#1E212D] hover:bg-[#262936] active:scale-95 text-[#11C76F] border border-[#11C76F]/20 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Quitar todo o valor restante agora"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#11C76F]" />
                <span>Quitar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#11C76F] bg-[#11C76F]/10 px-3 py-2 rounded-xl border border-[#11C76F]/20">
              <CheckCircle2 className="w-4 h-4 text-[#11C76F]" />
              <span>Dívida Totalmente Quitada</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenDetailsModal(account)}
            className="p-2 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
            title="Ver Detalhes, Contas e Parcelas"
          >
            <FileText className="w-4 h-4 text-[#11C76F]" />
          </button>
          <button
            onClick={() => onDeleteAccount(account.id)}
            className="p-2 text-[#8B95A5] hover:text-[#FF453A] hover:bg-[#241318] rounded-xl transition-colors cursor-pointer"
            title="Excluir Conta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
