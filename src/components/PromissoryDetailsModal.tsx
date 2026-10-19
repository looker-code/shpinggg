import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText,
  Plus,
  CheckCheck,
  CreditCard,
  Layers
} from 'lucide-react';
import { DebtAccount } from '../types';
import { formatCurrency, formatDate, calculateAccountFinancials } from '../utils/storage';

interface PromissoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: DebtAccount | null;
  onOpenPaymentModal: (account: DebtAccount) => void;
  onQuickSettle: (account: DebtAccount) => void;
}

export const PromissoryDetailsModal: React.FC<PromissoryDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
  onOpenPaymentModal,
  onQuickSettle,
}) => {
  if (!isOpen || !account) return null;

  const {
    totalPaid,
    totalRemaining,
    progressPercent,
    paidInstallments,
    totalInstallments,
    computedStatus,
  } = calculateAccountFinancials(account);

  const isQuitado = computedStatus === 'quitado';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#262936] overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className="bg-[#12141A] p-4 px-6 flex items-center justify-between border-b border-[#262936] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#11C76F]/10 text-[#11C76F] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">
                Extrato Completo da Dívida
              </span>
              <span className="text-xs text-[#8B95A5] ml-2 font-mono">
                {account.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E212D] hover:bg-[#262936] text-white border border-[#262936] rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Imprimir extrato"
            >
              <Printer className="w-3.5 h-3.5 text-[#11C76F]" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informações Principais da Pessoa */}
        <div className="p-6 sm:p-8 bg-[#12141A] border-b border-[#262936] relative overflow-hidden">
          {/* Stamp Quitado */}
          {isQuitado ? (
            <div className="absolute right-6 top-8 border-2 border-[#11C76F] text-[#11C76F] font-extrabold text-sm sm:text-base uppercase tracking-wider px-4 py-1.5 rounded-xl rotate-[-4deg] select-none bg-[#11C76F]/10 border-dashed">
              ✓ TOTALMENTE QUITADA
            </div>
          ) : (
            <div className="absolute right-6 top-8 border-2 border-[#FF9500] text-[#FF9500] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-3 py-1 rounded-xl rotate-[-4deg] select-none bg-[#FF9500]/10 border-dashed">
              EM ABERTO
            </div>
          )}

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#11C76F]/10 text-[#11C76F] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Pessoa da Conta</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{account.debtorName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-[#8B95A5]">
            <span>Código: <strong className="text-white font-mono">{account.code}</strong></span>
            <span>•</span>
            <span>Dívida Total: <strong className="text-[#11C76F] font-bold">{formatCurrency(account.totalAmount)}</strong></span>
            <span>•</span>
            <span>Data: <strong className="text-white">{formatDate(account.createdAt)}</strong></span>
          </div>

          {account.notes && (
            <p className="text-xs text-[#8B95A5] mt-3 pt-3 border-t border-[#262936]">
              Observações: {account.notes}
            </p>
          )}
        </div>

        {/* 1. ITENS DA CONTA EM ABERTO */}
        <div className="p-6 bg-[#161821] border-b border-[#262936] space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#11C76F]" />
            <span>Itens da Conta em Aberto ({account.debts.length})</span>
          </h3>

          <div className="space-y-1.5">
            {account.debts.map((debt, idx) => (
              <div 
                key={debt.id} 
                className="flex items-center justify-between p-3 bg-[#12141A] rounded-xl border border-[#262936] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E212D] text-[#8B95A5] flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white">{debt.name}</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {formatCurrency(debt.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-2 px-1">
            <span className="text-[#8B95A5]">SOMA TOTAL DAS CONTAS:</span>
            <span className="text-[#11C76F] text-sm">{formatCurrency(account.totalAmount)}</span>
          </div>
        </div>

        {/* 2. PARCELAS DA NEGOCIAÇÃO */}
        <div className="p-6 bg-[#12141A] border-b border-[#262936] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#11C76F]" />
              <span>Plano de Parcelas ({paidInstallments}/{totalInstallments} pagas)</span>
            </h3>
            <span className="text-xs text-[#8B95A5]">
              Base: {formatCurrency(account.installmentValue)}/mês
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {account.installments.map((inst) => {
              const isPaid = inst.status === 'pago';
              const isPartial = inst.status === 'parcial';
              const owed = Math.max(0, inst.originalAmount - inst.paidAmount);
              return (
                <div
                  key={inst.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    isPaid
                      ? 'bg-[#11C76F]/10 border-[#11C76F]/30'
                      : isPartial
                      ? 'bg-[#FF9500]/10 border-[#FF9500]/30'
                      : 'bg-[#161821] border-[#262936]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Parcela {inst.number}</span>
                      {isPaid && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#11C76F] text-[#0D0E12] px-1.5 py-0.2 rounded">
                          Paga
                        </span>
                      )}
                      {isPartial && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#FF9500] text-[#0D0E12] px-1.5 py-0.2 rounded">
                          Parcial
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8B95A5] block mt-0.5">
                      Valor original: {formatCurrency(inst.originalAmount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      Pago: <span className="text-[#11C76F]">{formatCurrency(inst.paidAmount)}</span>
                    </span>
                    {!isPaid && (
                      <span className="text-[10px] font-semibold text-[#FF9500] block">
                        Falta: {formatCurrency(owed)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. HISTÓRICO DE PAGAMENTOS REALIZADOS */}
        <div className="p-6 bg-[#161821] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#11C76F]" />
              <span>Histórico de Pagamentos Recebidos</span>
            </h3>
            <span className="text-xs text-[#8B95A5]">
              {account.payments.length} {account.payments.length === 1 ? 'pagamento' : 'pagamentos'}
            </span>
          </div>

          {account.payments.length === 0 ? (
            <div className="p-4 text-center bg-[#12141A] rounded-xl border border-[#262936] text-[#8B95A5] text-xs">
              Nenhum pagamento registrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#262936] rounded-xl overflow-hidden">
                <thead className="bg-[#12141A] text-[#8B95A5] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Forma</th>
                    <th className="p-3">Observação</th>
                    <th className="p-3 text-right">Valor Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262936] bg-[#12141A]/50">
                  {account.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1E212D]/50">
                      <td className="p-3 font-medium text-white">{formatDate(p.date)}</td>
                      <td className="p-3 font-bold uppercase text-[#11C76F]">{p.method}</td>
                      <td className="p-3 text-[#8B95A5]">{p.note || '-'}</td>
                      <td className="p-3 text-right font-bold text-[#11C76F]">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo Financeiro Final */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] flex flex-wrap items-center justify-between gap-4 pt-4">
            <div>
              <span className="text-xs text-[#8B95A5] font-medium block">Total Já Pago</span>
              <span className="text-base font-extrabold text-[#11C76F]">{formatCurrency(totalPaid)}</span>
            </div>

            <div>
              <span className="text-xs text-[#8B95A5] font-medium block">Saldo Restante da Dívida</span>
              <span className={`text-base font-extrabold ${isQuitado ? 'text-[#5F6876] line-through' : 'text-white'}`}>
                {formatCurrency(totalRemaining)}
              </span>
            </div>

            <div>
              <span className="text-xs text-[#8B95A5] font-medium block">Percentual Quitado</span>
              <span className="text-base font-extrabold text-[#11C76F]">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#12141A] border-t border-[#262936] flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {!isQuitado && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(account);
                }}
                className="px-4 py-2 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Adicionar Pago
              </button>
              <button
                onClick={() => {
                  onClose();
                  onQuickSettle(account);
                }}
                className="px-4 py-2 bg-[#1E212D] hover:bg-[#262936] text-[#11C76F] border border-[#11C76F]/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Quitar Dívida
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
