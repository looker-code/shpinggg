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
  ArrowUpRight 
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Quitado
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Vencida
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Parcial ({progressPercent}%)
          </span>
        );
      case 'pendente':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Em Aberto
          </span>
        );
    }
  };

  return (
    <div className={`relative bg-white rounded-3xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
      isFullyPaid 
        ? 'border-emerald-200/80 bg-emerald-50/20' 
        : isOverdue 
        ? 'border-rose-200 shadow-rose-100/30' 
        : 'border-slate-200/90 shadow-xs'
    }`}>
      {/* Top Banner & Number */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg tracking-wider">
              {note.code}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Emissão: {formatDate(note.issueDate)}
            </span>
          </div>
          {renderStatusBadge()}
        </div>

        <h3 className="font-extrabold text-lg text-slate-900 leading-snug tracking-tight line-clamp-1">
          {note.title}
        </h3>

        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Favorecido / Credor:</span>
            <span className="font-bold text-slate-800 truncate">{note.creditor}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Emitente / Devedor:</span>
            <span className="font-medium text-slate-700 truncate">{note.debtor}</span>
          </div>
        </div>
      </div>

      {/* Promissory Financial Numbers Section */}
      <div className="p-5 sm:p-6 py-4 bg-slate-50/60 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-slate-200/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Valor Original
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {formatCurrency(note.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Já Pago
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600">
              {formatCurrency(paidAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Saldo Restante
            </span>
            <span className={`text-xs sm:text-sm font-black ${
              isFullyPaid 
                ? 'text-slate-400 line-through' 
                : isOverdue 
                ? 'text-rose-600' 
                : 'text-slate-900'
            }`}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>Amortização</span>
            <span className={isFullyPaid ? 'text-emerald-600 font-bold' : 'text-slate-700 font-bold'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isFullyPaid ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Due Date Info */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Vencimento:</span>
            <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
              {formatDate(note.dueDate)}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {note.payments.length} {note.payments.length === 1 ? 'pagamento' : 'pagamentos'}
          </span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 sm:p-5 pt-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isFullyPaid ? (
            <>
              <button
                onClick={() => onOpenPaymentModal(note)}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pago</span>
              </button>

              <button
                onClick={() => onQuickSettle(note)}
                className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Quitar todo o saldo restante de uma só vez"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quitar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Promissória Liquidada</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenDetailsModal(note)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Ver Nota Promissória e Recibos"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Excluir Nota Promissória"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
