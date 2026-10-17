import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building2, 
  Plus, 
  CheckCheck, 
  FileText, 
  Trash2, 
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { PromissoryNote } from '../types';
import { formatCurrency, formatDate, calculateNoteFinancials } from '../utils/storage';

interface PromissoryCardProps {
  note: PromissoryNote;
  onOpenPaymentModal: (note: PromissoryNote) => void;
  onOpenDetailsModal: (note: PromissoryNote) => void;
  onQuickSettle: (note: PromissoryNote) => void;
  onDeleteNote: (id: string) => void;
}

export const PromissoryCard: React.FC<PromissoryCardProps> = ({
  note,
  onOpenPaymentModal,
  onOpenDetailsModal,
  onQuickSettle,
  onDeleteNote,
}) => {
  const { paidAmount, remainingAmount, progressPercent, isOverdue, computedStatus } =
    calculateNoteFinancials(note);

  const isFullyPaid = computedStatus === 'quitado';

  const renderStatusBadge = () => {
    switch (computedStatus) {
      case 'quitado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Liquidado
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Em Mora
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Amortizado ({progressPercent}%)
          </span>
        );
      case 'pendente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Exigível
          </span>
        );
    }
  };

  return (
    <div className={`relative bg-[#0e1424] rounded-3xl border transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden font-['Inter',sans-serif] ${
      isFullyPaid 
        ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]' 
        : isOverdue 
        ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.08)]' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Card Section */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-[#131b2e] text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg tracking-wider">
              {note.code}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Emissão: {formatDate(note.issueDate)}
            </span>
          </div>
          {renderStatusBadge()}
        </div>

        <h3 className="font-bold text-base sm:text-lg text-white font-['Space_Grotesk',sans-serif] leading-snug tracking-tight line-clamp-1">
          {note.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Beneficiário:</span>
            <span className="font-semibold text-slate-200 truncate">{note.creditor}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-400">Emitente:</span>
            <span className="text-slate-300 truncate">{note.debtor}</span>
          </div>
        </div>
      </div>

      {/* Financial Figures Section */}
      <div className="p-5 sm:p-6 py-4 bg-[#0a0f1c]/90 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Valor Nominal
            </span>
            <span className="text-xs sm:text-sm font-mono font-semibold text-slate-300">
              {formatCurrency(note.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
              Amortizado
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
              {formatCurrency(paidAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Devedor
            </span>
            <span className={`text-xs sm:text-sm font-mono font-black ${
              isFullyPaid 
                ? 'text-slate-500 line-through' 
                : isOverdue 
                ? 'text-rose-400' 
                : 'text-white'
            }`}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>Amortização Fiduciária</span>
            <span className={isFullyPaid ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isFullyPaid ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Due Date & Place */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Vencimento:</span>
            <span className={`font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatDate(note.dueDate)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {note.payments.length} {note.payments.length === 1 ? 'amortização' : 'amortizações'}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-3 bg-[#0e1424] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isFullyPaid ? (
            <>
              <button
                onClick={() => onOpenPaymentModal(note)}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>Amortizar</span>
              </button>

              <button
                onClick={() => onQuickSettle(note)}
                className="bg-[#131b2e] hover:bg-[#1a253f] active:scale-95 text-emerald-300 border border-emerald-500/30 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Quitar todo o saldo restante com eficácia liberatória"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Liquidar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Título Resgatado</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenDetailsModal(note)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Visualizar Cédula / Nota Promissória Formal"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            title="Excluir Registro da Promissória"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
