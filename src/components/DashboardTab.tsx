import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  ChevronRight,
  TrendingDown,
  CreditCard,
  Building2
} from 'lucide-react';
import { PromissoryNote } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  calculateNoteFinancials, 
  calculateDashboardSummary 
} from '../utils/storage';

interface DashboardTabProps {
  notes: PromissoryNote[];
  onOpenNewAccount: () => void;
  onNavigateToPayable: () => void;
  onOpenPaymentModal: (note: PromissoryNote) => void;
  onOpenDetailsModal: (note: PromissoryNote) => void;
  onQuickSettle: (note: PromissoryNote) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  notes,
  onOpenNewAccount,
  onNavigateToPayable,
  onOpenPaymentModal,
  onOpenDetailsModal,
  onQuickSettle,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const summary = calculateDashboardSummary(notes);

  // Próximas promissórias pendentes
  const pendingNotes = notes
    .filter((n) => {
      const { remainingAmount } = calculateNoteFinancials(n);
      return remainingAmount > 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Histórico de pagamentos recentes
  const recentPayments = notes
    .flatMap((n) =>
      (n.payments || []).map((p) => ({
        ...p,
        noteCode: n.code,
        noteTitle: n.title,
        creditor: n.creditor,
        noteId: n.id,
      }))
    )
    .sort((a, b) => new Date(b.registeredAt || b.date).getTime() - new Date(a.registeredAt || a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* PicPay Balance Card */}
      <div className="bg-[#161821] rounded-3xl border border-[#262936] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#11C76F]/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-[#8B95A5]">
                Saldo total a pagar
              </span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-[#8B95A5] hover:text-white transition-colors cursor-pointer p-0.5"
                title={showBalance ? "Ocultar valores" : "Mostrar valores"}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {showBalance ? formatCurrency(summary.totalPending) : 'R$ ••••••••'}
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-[#8B95A5]">
              <span className="text-[#11C76F] font-bold">
                {summary.liquidityRate}% já liquidado
              </span>
              <span>•</span>
              <span>{summary.totalNotesCount} notas cadastradas</span>
            </div>
          </div>

          {/* Quick Action Buttons (PicPay Quick Actions) */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewAccount}
              className="bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-sm px-5 py-3 rounded-2xl shadow-[0_4px_16px_rgba(17,199,111,0.2)] flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Promissória</span>
            </button>

            <button
              onClick={onNavigateToPayable}
              className="bg-[#1E212D] hover:bg-[#262936] text-white font-bold text-sm px-5 py-3 rounded-2xl border border-[#262936] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Ver Todas</span>
              <ChevronRight className="w-4 h-4 text-[#8B95A5]" />
            </button>
          </div>
        </div>

        {/* PicPay Progress Bar */}
        <div className="mt-6 pt-6 border-t border-[#262936]">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[#8B95A5]">Progresso de quitação da carteira</span>
            <span className="text-white font-mono">{summary.liquidityRate}%</span>
          </div>
          <div className="w-full bg-[#12141A] h-2.5 rounded-full overflow-hidden border border-[#262936]">
            <div 
              className="bg-[#11C76F] h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.liquidityRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Tiles (PicPay clean style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tile 1: Total Já Pago */}
        <div className="bg-[#161821] p-5 rounded-2xl border border-[#262936]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B95A5]">
              Total Já Pago
            </span>
            <div className="w-8 h-8 rounded-full bg-[#11C76F]/10 text-[#11C76F] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#11C76F] tracking-tight">
            {showBalance ? formatCurrency(summary.totalPaid) : 'R$ ••••••'}
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">Valores já amortizados</p>
        </div>

        {/* Tile 2: Total Nominal */}
        <div className="bg-[#161821] p-5 rounded-2xl border border-[#262936]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B95A5]">
              Valor Nominal Total
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1E212D] text-[#8B95A5] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {showBalance ? formatCurrency(summary.totalOriginal) : 'R$ ••••••'}
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">Soma das promissórias</p>
        </div>

        {/* Tile 3: Status das Contas */}
        <div className="bg-[#161821] p-5 rounded-2xl border border-[#262936]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B95A5]">
              Status dos Títulos
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1E212D] text-[#8B95A5] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-[#8B95A5] block font-bold">QUITADAS</span>
              <span className="text-xl font-extrabold text-[#11C76F]">{summary.paidCount}</span>
            </div>
            <div className="h-6 w-px bg-[#262936]" />
            <div>
              <span className="text-[10px] text-[#8B95A5] block font-bold">PARCIAIS</span>
              <span className="text-xl font-extrabold text-[#FF9500]">{summary.partialCount}</span>
            </div>
            <div className="h-6 w-px bg-[#262936]" />
            <div>
              <span className="text-[10px] text-[#8B95A5] block font-bold">VENCIDAS</span>
              <span className={`text-xl font-extrabold ${summary.overdueCount > 0 ? 'text-[#FF3B30]' : 'text-[#8B95A5]'}`}>
                {summary.overdueCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Próximos Vencimentos + Extrato de Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Próximos Vencimentos */}
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#262936]">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Próximos Vencimentos
                </h3>
                <p className="text-xs text-[#8B95A5]">Contas que exigem atenção</p>
              </div>
              <button
                onClick={onNavigateToPayable}
                className="text-xs font-bold text-[#11C76F] hover:text-[#0EAD60] flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingNotes.length === 0 ? (
              <div className="py-12 text-center text-[#8B95A5]">
                <CheckCircle2 className="w-12 h-12 text-[#11C76F] mx-auto mb-2 opacity-80" />
                <p className="font-bold text-white text-sm">Tudo pago por aqui!</p>
                <p className="text-xs text-[#8B95A5] mt-1">Nenhuma promissória em aberto no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingNotes.map((note) => {
                  const { remainingAmount, isOverdue } = calculateNoteFinancials(note);
                  return (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-2xl border border-[#262936] bg-[#12141A] hover:bg-[#1A1D27] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1E212D] text-[#11C76F] flex items-center justify-center font-bold text-xs shrink-0 border border-[#262936]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {note.creditor}
                            </span>
                            <span className="text-[10px] font-mono text-[#8B95A5] bg-[#1E212D] px-1.5 py-0.5 rounded">
                              {note.code}
                            </span>
                          </div>
                          <p className="text-xs text-[#8B95A5] truncate mt-0.5">
                            {note.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[11px] font-medium flex items-center gap-1 ${isOverdue ? 'text-[#FF453A] font-bold' : 'text-[#8B95A5]'}`}>
                              <Calendar className="w-3 h-3" />
                              Vence {formatDate(note.dueDate)}
                            </span>
                            {isOverdue && (
                              <span className="text-[9px] font-extrabold uppercase bg-[#FF3B30]/20 text-[#FF453A] px-1.5 py-0.2 rounded">
                                Vencida
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-extrabold text-white">
                          {showBalance ? formatCurrency(remainingAmount) : 'R$ ••••••'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenPaymentModal(note)}
                            className="bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] text-xs font-extrabold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                          <button
                            onClick={() => onQuickSettle(note)}
                            className="bg-[#1E212D] hover:bg-[#262936] text-[#8B95A5] hover:text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Quitar total agora"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#262936] text-center">
            <button
              onClick={onOpenNewAccount}
              className="text-xs font-bold text-[#8B95A5] hover:text-[#11C76F] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#11C76F]" />
              <span>Cadastrar nova promissória</span>
            </button>
          </div>
        </div>

        {/* Right Column: Últimos Pagamentos */}
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#262936]">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Últimos Pagamentos
                </h3>
                <p className="text-xs text-[#8B95A5]">Histórico recente de pagamentos</p>
              </div>
              <span className="text-xs text-[#8B95A5] font-semibold">
                Confirmados
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-12 text-center text-[#8B95A5]">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-white text-sm">Nenhum pagamento registrado.</p>
                <p className="text-xs text-[#8B95A5] mt-1">Ao registrar um pagamento ele aparecerá aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3.5 rounded-2xl border border-[#262936] bg-[#12141A] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] flex items-center justify-center font-bold text-xs shrink-0 border border-[#11C76F]/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {payment.creditor}
                          </span>
                          <span className="text-[10px] font-mono text-[#8B95A5] bg-[#1E212D] px-1.5 py-0.5 rounded">
                            {payment.noteCode}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B95A5] truncate mt-0.5">
                          {payment.noteTitle}
                        </p>
                        <p className="text-[11px] text-[#8B95A5] mt-0.5">
                          {formatDate(payment.date)} • Via <span className="uppercase text-white font-semibold">{payment.method}</span>
                          {payment.note && ` • "${payment.note}"`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-[#11C76F] block">
                        + {showBalance ? formatCurrency(payment.amount) : 'R$ ••••••'}
                      </span>
                      <span className="text-[10px] font-bold text-[#11C76F] bg-[#11C76F]/10 px-2 py-0.5 rounded-md border border-[#11C76F]/20">
                        Pago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#262936] flex items-center justify-between text-xs text-[#8B95A5]">
            <span>Total pago acumulado</span>
            <span className="font-extrabold text-[#11C76F]">
              {showBalance ? formatCurrency(summary.totalPaid) : 'R$ ••••••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
