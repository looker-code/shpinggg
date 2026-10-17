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
  Wallet,
  Activity,
  ArrowDownLeft,
  Scale
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

  // Próximos vencimentos com saldo devedor positivo
  const pendingNotes = notes
    .filter((n) => {
      const { remainingAmount } = calculateNoteFinancials(n);
      return remainingAmount > 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Histórico recente consolidado
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
    <div className="space-y-8 pb-16 font-['Inter',sans-serif]">
      {/* Top Treasury Banner */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#091b24] to-[#0a1420] rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-mono font-bold mb-3 border border-emerald-500/30">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>POSIÇÃO CONSOLIDADA DE TESOURARIA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk',sans-serif]">
              Gestão de Passivo & Promissórias
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Painel de governança fiduciária para controle de títulos executivos, apuração de saldos devedores e registro formal de amortizações.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewAccount}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Emitir Novo Título</span>
            </button>
            <button
              onClick={onNavigateToPayable}
              className="bg-[#131b2e] hover:bg-[#1a253f] text-slate-200 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Acessar Livro Razão</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Devedor Restante */}
        <div className="bg-[#0e1424] p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Passivo Exigível Restante
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatCurrency(summary.totalPending)}
          </div>
          <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1 font-medium">
            <span>Saldo a liquidar na carteira ativa</span>
          </div>
        </div>

        {/* Card 2: Total Já Amortizado */}
        <div className="bg-[#0e1424] p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Amortização Acumulada
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium">
            <span>{summary.liquidityRate}% do valor nominal resgatado</span>
          </div>
        </div>

        {/* Card 3: Valor Nominal Total */}
        <div className="bg-[#0e1424] p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Volume Nominal Emitido
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight">
            {formatCurrency(summary.totalOriginal)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span>{summary.totalNotesCount} títulos cadastrados</span>
          </div>
        </div>

        {/* Card 4: Distribuição de Títulos */}
        <div className="bg-[#0e1424] p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Status da Carteira
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">LIQUIDADAS</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{summary.paidCount}</span>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">PARCIAIS</span>
              <span className="text-xl font-black text-amber-400 font-mono">{summary.partialCount}</span>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">EM MORA</span>
              <span className={`text-xl font-black font-mono ${summary.overdueCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                {summary.overdueCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidity Progress Bar Card */}
      <div className="bg-[#0e1424] p-6 rounded-3xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-100 font-['Space_Grotesk',sans-serif]">
              Taxa Geral de Amortização & Adimplemento Fiduciário
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {summary.liquidityRate}% liquidado
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {formatCurrency(summary.totalPaid)} de {formatCurrency(summary.totalOriginal)}
          </span>
        </div>
        <div className="w-full bg-[#080c16] h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${summary.liquidityRate}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Próximos Vencimentos + Extrato de Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Próximos Vencimentos */}
        <div className="bg-[#0e1424] rounded-3xl border border-slate-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-slate-100 font-['Space_Grotesk',sans-serif]">
                  Obrigações com Vencimento Iminente
                </h3>
              </div>
              <button
                onClick={onNavigateToPayable}
                className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver livro completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-300 text-sm">Todas as promissórias da carteira foram liquidadas.</p>
                <p className="text-xs text-slate-500 mt-1">Nenhuma obrigação pendente de quitação.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingNotes.map((note) => {
                  const { remainingAmount, isOverdue } = calculateNoteFinancials(note);
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border border-slate-800/80 bg-[#12192b]/70 hover:bg-[#151f36] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                            {note.code}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-mono font-black uppercase text-rose-300 bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" /> Em Mora
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 truncate mt-1">
                          {note.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          Credor: <span className="text-slate-300 font-medium">{note.creditor}</span> • Venc.: <span className="font-mono text-slate-300">{formatDate(note.dueDate)}</span>
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-black text-white font-mono">
                          {formatCurrency(remainingAmount)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenPaymentModal(note)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Amortizar
                          </button>
                          <button
                            onClick={() => onQuickSettle(note)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Liquidação integral de saldo"
                          >
                            Liquidar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-center">
            <button
              onClick={onOpenNewAccount}
              className="text-xs font-mono font-bold text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Emitir e registrar novo título de promissória</span>
            </button>
          </div>
        </div>

        {/* Right Column: Últimos Pagamentos */}
        <div className="bg-[#0e1424] rounded-3xl border border-slate-800 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-slate-100 font-['Space_Grotesk',sans-serif]">
                  Extrato de Amortizações Recentes
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Lançamentos confirmados
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-slate-300 text-sm">Nenhum pagamento registrado no período.</p>
                <p className="text-xs text-slate-500 mt-1">As amortizações lançadas serão auditadas nesta seção.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3.5 rounded-2xl border border-slate-800/80 bg-[#12192b]/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        R$
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {payment.noteTitle}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {payment.noteCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {formatDate(payment.date)} • Via: <span className="uppercase text-slate-300 font-semibold">{payment.method}</span>
                          {payment.note && ` • "${payment.note}"`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-400 font-mono block">
                        + {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Amortizado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Amortizações averbadas em nota</span>
            <span className="font-bold text-emerald-400">Total: {formatCurrency(summary.totalPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
