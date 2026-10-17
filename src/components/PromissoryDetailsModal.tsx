import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { PromissoryNote } from '../types';
import { formatCurrency, formatDate, calculateNoteFinancials } from '../utils/storage';

interface PromissoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: PromissoryNote | null;
  onOpenPaymentModal: (note: PromissoryNote) => void;
  onQuickSettle: (note: PromissoryNote) => void;
}

export const PromissoryDetailsModal: React.FC<PromissoryDetailsModalProps> = ({
  isOpen,
  onClose,
  note,
  onOpenPaymentModal,
  onQuickSettle,
}) => {
  if (!isOpen || !note) return null;

  const { paidAmount, remainingAmount, progressPercent, computedStatus } =
    calculateNoteFinancials(note);

  const isQuitado = computedStatus === 'quitado';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm tracking-wide">
              Documento da Nota Promissória #{note.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Promissory Note Visual Certificate */}
        <div className="p-6 sm:p-8 bg-amber-50/40 relative border-b-2 border-dashed border-amber-200">
          {/* Stamp watermark */}
          {isQuitado ? (
            <div className="absolute right-8 top-12 border-4 border-emerald-600 text-emerald-700 font-black text-2xl sm:text-3xl uppercase tracking-widest px-6 py-2 rounded-2xl rotate-[-12deg] opacity-80 pointer-events-none select-none shadow-lg shadow-emerald-600/10 bg-emerald-50/70">
              ★ QUITADO ★
            </div>
          ) : (
            <div className="absolute right-8 top-12 border-4 border-amber-500 text-amber-700 font-black text-xl sm:text-2xl uppercase tracking-widest px-5 py-2 rounded-2xl rotate-[-10deg] opacity-70 pointer-events-none select-none bg-amber-50/70">
              {computedStatus === 'parcial' ? 'PARCIAL' : 'EM COBRANÇA'}
            </div>
          )}

          {/* Formal Promissory Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 mb-4 gap-2">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                TÍTULO DE CRÉDITO
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                NOTA PROMISSÓRIA
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs font-mono font-black text-slate-800">
                Nº: {note.code}
              </div>
              <div className="text-lg font-black text-slate-950">
                VALOR: {formatCurrency(note.totalAmount)}
              </div>
            </div>
          </div>

          {/* Formal Legal text */}
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-3 font-serif">
            <p>
              No dia <strong>{formatDate(note.dueDate)}</strong>, pagarei por esta única via de
              <strong> NOTA PROMISSÓRIA</strong> a <strong>{note.creditor}</strong>, ou à sua ordem, a
              quantia de <strong>{formatCurrency(note.totalAmount)}</strong> em moeda corrente deste país.
            </p>
            <p className="text-xs text-slate-600 font-sans">
              Pagável na praça de: <strong>{note.place || 'São Paulo - SP'}</strong>.
            </p>
            {note.notes && (
              <p className="text-xs italic text-slate-600 font-sans bg-amber-100/40 p-2.5 rounded-xl border border-amber-200/60">
                Observações: {note.notes}
              </p>
            )}
          </div>

          {/* Signatures block */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Emitente / Devedor:
              </div>
              <div className="font-bold text-slate-900 mt-0.5">{note.debtor}</div>
              <div className="mt-4 pt-1 border-t border-slate-400 w-48 text-[10px] text-slate-500">
                Assinatura do Emitente
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Data de Emissão:
              </div>
              <div className="font-bold text-slate-900 mt-0.5">{formatDate(note.issueDate)}</div>
              <div className="mt-4 pt-1 border-t border-slate-400 w-48 text-[10px] text-slate-500">
                Local e Praça
              </div>
            </div>
          </div>
        </div>

        {/* Amortization / Payments Timeline */}
        <div className="p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Extrato de Amortizações & Pagamentos Realizados</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {note.payments.length} {note.payments.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {note.payments.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
              Nenhuma amortização foi registrada até o momento. O débito permanece integral em aberto.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Observação / Recibo</th>
                    <th className="p-3 text-right">Valor Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {note.payments.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-medium text-slate-800">{formatDate(p.date)}</td>
                      <td className="p-3 font-semibold uppercase text-slate-700">{p.method}</td>
                      <td className="p-3 text-slate-600">{p.note || '-'}</td>
                      <td className="p-3 text-right font-black text-emerald-600">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Balance Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Já Pago</span>
              <span className="text-base font-black text-emerald-600">{formatCurrency(paidAmount)}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">Saldo Restante</span>
              <span className={`text-base font-black ${isQuitado ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">Percentual Quitado</span>
              <span className="text-base font-black text-emerald-700">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 px-6 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {!isQuitado && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(note);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Adicionar Pagamento
              </button>
              <button
                onClick={() => {
                  onClose();
                  onQuickSettle(note);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Quitar Promissória
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
