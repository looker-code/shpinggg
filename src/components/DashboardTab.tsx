import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  FileText, 
  DollarSign, 
  Calendar, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  PiggyBank
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
  const summary = calculateDashboardSummary(notes);
  const totalPercentPaid = summary.totalOriginal > 0
    ? Math.round((summary.totalPaid / summary.totalOriginal) * 100)
    : 100;

  // Próximas contas a vencer (que ainda possuem saldo a pagar)
  const pendingNotes = notes
    .filter((n) => {
      const { remainingAmount } = calculateNoteFinancials(n);
      return remainingAmount > 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Histórico de pagamentos recentes consolidados
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
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Painel Financeiro em Tempo Real
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Controle de Promissórias
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Acompanhe seus débitos emitidos, registre pagamentos parciais e realize quitações de forma simples e organizada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewAccount}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>Nova Promissória</span>
            </button>
            <button
              onClick={onNavigateToPayable}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-2xl backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Ver Todas as Contas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Devedor Restante */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saldo Restante a Pagar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(summary.totalPending)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span>Débito ativo em aberto</span>
          </div>
        </div>

        {/* Card 2: Total Já Pago */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Já Amortizado
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <span>{totalPercentPaid}% do valor total quitado</span>
          </div>
        </div>

        {/* Card 3: Total Geral Emitido */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Valor Nominal Total
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(summary.totalOriginal)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span>{summary.totalNotesCount} notas cadastradas</span>
          </div>
        </div>

        {/* Card 4: Quitações & Vencimentos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Status das Contas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Quitadas</span>
              <span className="text-xl font-black text-emerald-600">{summary.paidCount}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Parciais</span>
              <span className="text-xl font-black text-amber-600">{summary.partialCount}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Vencidas</span>
              <span className="text-xl font-black text-rose-600">{summary.overdueCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">Progresso Geral de Quitação da Carteira</h3>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {totalPercentPaid}% pago
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {formatCurrency(summary.totalPaid)} de {formatCurrency(summary.totalOriginal)}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${totalPercentPaid}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Upcoming Due Dates + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Próximos Vencimentos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Próximos Vencimentos
                </h3>
              </div>
              <button
                onClick={onNavigateToPayable}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-700 text-sm">Parabéns! Todas as contas estão quitadas.</p>
                <p className="text-xs text-slate-500 mt-1">Nenhum pagamento pendente no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingNotes.map((note) => {
                  const { remainingAmount, paidAmount, isOverdue } = calculateNoteFinancials(note);
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {note.code}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vencida
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 truncate mt-1">
                          {note.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          Favorecido: <span className="font-semibold text-slate-700">{note.creditor}</span> • Vence: <span className="font-semibold">{formatDate(note.dueDate)}</span>
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(remainingAmount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenPaymentModal(note)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                          <button
                            onClick={() => onQuickSettle(note)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <button
              onClick={onOpenNewAccount}
              className="text-xs font-bold text-slate-600 hover:text-emerald-600 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Adicionar nova conta ou nota promissória</span>
            </button>
          </div>
        </div>

        {/* Right Column: Últimos Pagamentos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Últimos Pagamentos Realizados
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Histórico recente
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-slate-700 text-sm">Nenhum pagamento registrado ainda.</p>
                <p className="text-xs text-slate-500 mt-1">Ao registrar um pagamento na aba "A Pagar", ele aparecerá aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        R$
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {payment.noteTitle}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {payment.noteCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {formatDate(payment.date)} • Método: <span className="font-semibold uppercase text-slate-700">{payment.method}</span>
                          {payment.note && ` • "${payment.note}"`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-600 block">
                        + {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Pago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Valores amortizados diretamente na nota</span>
            <span className="font-bold text-slate-700">Total: {formatCurrency(summary.totalPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
