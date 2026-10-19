import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Building2, 
  User, 
  MapPin, 
  FileText,
  ShieldCheck,
  Plus,
  CheckCheck
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
                Comprovante da Promissória
              </span>
              <span className="text-xs text-[#8B95A5] ml-2 font-mono">
                {note.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E212D] hover:bg-[#262936] text-white border border-[#262936] rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Imprimir documento"
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

        {/* Certificate / Digital Promissory Note Body */}
        <div className="p-6 sm:p-8 bg-[#12141A] border-b border-[#262936] relative overflow-hidden">
          {/* Stamp watermark */}
          {isQuitado ? (
            <div className="absolute right-6 top-8 border-2 border-[#11C76F] text-[#11C76F] font-extrabold text-sm sm:text-base uppercase tracking-wider px-4 py-1.5 rounded-xl rotate-[-6deg] select-none bg-[#11C76F]/10 border-dashed">
              ✓ PROMISSÓRIA QUITADA
            </div>
          ) : (
            <div className="absolute right-6 top-8 border-2 border-[#FF9500] text-[#FF9500] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-3 py-1 rounded-xl rotate-[-4deg] select-none bg-[#FF9500]/10 border-dashed">
              EM COBRANÇA
            </div>
          )}

          {/* Promissory Title Header */}
          <div className="border-b border-[#262936] pb-4 mb-5">
            <span className="text-[11px] font-bold text-[#11C76F] uppercase tracking-wider block mb-1">
              Título de Crédito • Nota Promissória
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {note.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#8B95A5]">
              <span>Número: <strong className="text-white font-mono">{note.code}</strong></span>
              <span>•</span>
              <span>Valor Nominal: <strong className="text-[#11C76F] font-bold">{formatCurrency(note.totalAmount)}</strong></span>
            </div>
          </div>

          {/* Legal Promissory Text */}
          <div className="text-slate-300 text-sm leading-relaxed space-y-3 bg-[#161821] p-5 rounded-2xl border border-[#262936]">
            <p>
              No dia <strong className="text-white underline decoration-[#11C76F]">{formatDate(note.dueDate)}</strong>, pagarei(emos) por esta única via de
              <strong className="text-white"> NOTA PROMISSÓRIA</strong> a <strong className="text-white">{note.creditor}</strong>
              {note.creditorDoc && <span className="text-xs text-[#8B95A5]"> (CPF/CNPJ: {note.creditorDoc})</span>}, ou à sua ordem, a
              quantia de <strong className="text-[#11C76F] font-bold">{formatCurrency(note.totalAmount)}</strong> em moeda corrente nacional.
            </p>
            <p className="text-xs text-[#8B95A5]">
              Praça de Pagamento: <strong className="text-white">{note.place || 'São Paulo - SP'}</strong>.
            </p>
            {note.notes && (
              <p className="text-xs text-[#8B95A5] pt-1 border-t border-[#262936]">
                Observações: {note.notes}
              </p>
            )}
          </div>

          {/* Signatures / Parties */}
          <div className="mt-6 pt-5 border-t border-[#262936] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#8B95A5]">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#5F6876]">Emitente / Devedor:</span>
              <span className="font-bold text-white block mt-0.5">{note.debtor}</span>
              {note.debtorDoc && <span className="text-[11px] text-[#8B95A5]">{note.debtorDoc}</span>}
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-[#5F6876]">Data de Emissão:</span>
              <span className="font-bold text-white block mt-0.5">{formatDate(note.issueDate)}</span>
            </div>
          </div>
        </div>

        {/* Amortization Ledger */}
        <div className="p-6 bg-[#161821] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#11C76F]" />
              <span>Histórico de Amortizações & Pagamentos</span>
            </h3>
            <span className="text-xs text-[#8B95A5]">
              {note.payments.length} {note.payments.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {note.payments.length === 0 ? (
            <div className="p-6 text-center bg-[#12141A] rounded-2xl border border-[#262936] text-[#8B95A5] text-xs">
              Nenhum pagamento registrado nesta nota até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#262936] rounded-xl overflow-hidden">
                <thead className="bg-[#12141A] text-[#8B95A5] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Forma</th>
                    <th className="p-3">Observação / Recibo</th>
                    <th className="p-3 text-right">Valor Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262936] bg-[#12141A]/50">
                  {note.payments.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-[#1E212D]/50">
                      <td className="p-3 font-medium text-white">{formatDate(p.date)}</td>
                      <td className="p-3 font-bold uppercase text-[#11C76F]">{p.method}</td>
                      <td className="p-3 text-[#8B95A5]">{p.note || p.authCode || '-'}</td>
                      <td className="p-3 text-right font-bold text-[#11C76F]">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Balance breakdown */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#8B95A5] font-medium block">Total Já Pago</span>
              <span className="text-base font-extrabold text-[#11C76F]">{formatCurrency(paidAmount)}</span>
            </div>

            <div>
              <span className="text-xs text-[#8B95A5] font-medium block">Saldo Restante</span>
              <span className={`text-base font-extrabold ${isQuitado ? 'text-[#5F6876] line-through' : 'text-white'}`}>
                {formatCurrency(remainingAmount)}
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
                  onOpenPaymentModal(note);
                }}
                className="px-4 py-2 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Adicionar Pago
              </button>
              <button
                onClick={() => {
                  onClose();
                  onQuickSettle(note);
                }}
                className="px-4 py-2 bg-[#1E212D] hover:bg-[#262936] text-[#11C76F] border border-[#11C76F]/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
