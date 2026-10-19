import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building2, 
  Plus, 
  CheckCheck, 
  FileText, 
  Trash2 
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Quitado
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#FF3B30]/10 text-[#FF453A] border border-[#FF3B30]/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Vencida
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">
            <Clock className="w-3.5 h-3.5" />
            Parcial ({progressPercent}%)
          </span>
        );
      case 'pendente':
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
        : isOverdue 
        ? 'border-[#FF3B30]/30' 
        : 'border-[#262936]'
    }`}>
      {/* Top Card Section */}
      <div className="p-5 sm:p-6 pb-4 border-b border-[#262936]">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#1E212D] text-[#11C76F] border border-[#262936] px-2 py-0.5 rounded-lg">
              {note.code}
            </span>
            <span className="text-[11px] text-[#8B95A5]">
              {formatDate(note.issueDate)}
            </span>
          </div>
          {renderStatusBadge()}
        </div>

        <h3 className="font-bold text-base text-white leading-snug tracking-tight line-clamp-1">
          {note.title}
        </h3>

        <div className="mt-2.5 space-y-1 text-xs text-[#8B95A5]">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#11C76F] shrink-0" />
            <span>Favorecido:</span>
            <span className="font-semibold text-white truncate">{note.creditor}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-[#8B95A5] shrink-0" />
            <span>Devedor:</span>
            <span className="text-slate-300 truncate">{note.debtor}</span>
          </div>
        </div>
      </div>

      {/* Financial Figures Section (PicPay Clean Numbers) */}
      <div className="p-5 sm:p-6 py-4 bg-[#12141A] flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-[#262936]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block">
              Original
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white">
              {formatCurrency(note.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#11C76F] block">
              Já Pago
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#11C76F]">
              {formatCurrency(paidAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block">
              Saldo
            </span>
            <span className={`text-xs sm:text-sm font-extrabold ${
              isFullyPaid 
                ? 'text-[#5F6876] line-through' 
                : isOverdue 
                ? 'text-[#FF453A]' 
                : 'text-white'
            }`}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8B95A5] mb-1">
            <span>Amortização</span>
            <span className={isFullyPaid ? 'text-[#11C76F] font-bold' : 'text-white font-bold'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#1E212D] h-2 rounded-full overflow-hidden border border-[#262936]">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isFullyPaid ? 'bg-[#11C76F]' : 'bg-[#11C76F]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Due Date & Payments count */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-[#8B95A5]">
            <Calendar className="w-3.5 h-3.5 text-[#8B95A5]" />
            <span>Vencimento:</span>
            <span className={`font-semibold ${isOverdue ? 'text-[#FF453A]' : 'text-white'}`}>
              {formatDate(note.dueDate)}
            </span>
          </div>
          <span className="text-[11px] text-[#8B95A5]">
            {note.payments.length} {note.payments.length === 1 ? 'pagamento' : 'pagamentos'}
          </span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 sm:p-5 pt-3 bg-[#161821] border-t border-[#262936] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isFullyPaid ? (
            <>
              <button
                onClick={() => onOpenPaymentModal(note)}
                className="bg-[#11C76F] hover:bg-[#0EAD60] active:scale-95 text-[#0D0E12] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar Pago</span>
              </button>

              <button
                onClick={() => onQuickSettle(note)}
                className="bg-[#1E212D] hover:bg-[#262936] active:scale-95 text-[#11C76F] border border-[#11C76F]/20 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Quitar todo o saldo restante de uma vez"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#11C76F]" />
                <span>Quitar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#11C76F] bg-[#11C76F]/10 px-3 py-2 rounded-xl border border-[#11C76F]/20">
              <CheckCircle2 className="w-4 h-4 text-[#11C76F]" />
              <span>Promissória Liquidada</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenDetailsModal(note)}
            className="p-2 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
            title="Ver Comprovante e Promissória"
          >
            <FileText className="w-4 h-4 text-[#11C76F]" />
          </button>
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 text-[#8B95A5] hover:text-[#FF453A] hover:bg-[#241318] rounded-xl transition-colors cursor-pointer"
            title="Excluir Promissória"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
