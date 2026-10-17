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
  FileText,
  ShieldCheck,
  Scale
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-['Inter',sans-serif]">
      <div 
        className="bg-[#0e1424] rounded-3xl w-full max-w-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-slate-800 overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls Bar */}
        <div className="bg-[#080c16] text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span className="font-mono font-bold text-xs sm:text-sm tracking-wide text-slate-200">
              CÉDULA EXECUTIVA #{note.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131b2e] hover:bg-[#1a253f] text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              title="Imprimir Cédula Formal"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Promissory Note Visual Certificate (Dark luxury parchment) */}
        <div className="p-6 sm:p-8 bg-[#090e1b] relative border-b border-dashed border-emerald-500/30 overflow-hidden">
          {/* Subtle background security pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Stamp watermark */}
          {isQuitado ? (
            <div className="absolute right-6 top-10 border-4 border-emerald-500 text-emerald-400 font-mono font-black text-xl sm:text-2xl uppercase tracking-widest px-6 py-2 rounded-2xl rotate-[-12deg] select-none shadow-[0_0_25px_rgba(16,185,129,0.4)] bg-[#071317]/90 border-dashed">
              ★ QUITADO E RESGATADO ★
            </div>
          ) : (
            <div className="absolute right-6 top-10 border-3 border-amber-500/80 text-amber-400 font-mono font-black text-lg sm:text-xl uppercase tracking-widest px-4 py-1.5 rounded-xl rotate-[-8deg] select-none bg-[#131109]/90 border-dashed">
              {computedStatus === 'vencido' ? 'EM MORA / PROTESTÁVEL' : 'TÍTULO EXIGÍVEL'}
            </div>
          )}

          {/* Formal Promissory Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/40 pb-4 mb-5 gap-2 relative z-10">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                DECRETO Nº 2.044/1908 • LEI UNIFORME DE GENEBRA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Newsreader',serif] italic mt-0.5">
                Nota Promissória
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs font-mono font-bold text-slate-400">
                Nº: <span className="text-emerald-400">{note.code}</span>
              </div>
              <div className="text-lg font-mono font-black text-white">
                {formatCurrency(note.totalAmount)}
              </div>
            </div>
          </div>

          {/* Formal Legal text */}
          <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-['Newsreader',serif] relative z-10">
            <p className="indent-6">
              No dia <strong className="font-mono text-emerald-300 font-bold">{formatDate(note.dueDate)}</strong>, pagarei(emos) por esta única via de
              <strong className="text-white"> NOTA PROMISSÓRIA</strong> à ordem de <strong className="text-white underline decoration-emerald-500/60">{note.creditor}</strong>
              {note.creditorDoc && <span className="font-mono text-xs text-slate-400"> (CNPJ/CPF: {note.creditorDoc})</span>}, ou à sua ordem, a
              quantia líquida, certa e exigível de <strong className="font-mono text-emerald-400 font-bold">{formatCurrency(note.totalAmount)}</strong> em moeda corrente nacional.
            </p>
            <p className="text-xs text-slate-400 font-sans">
              Pagável e exigível na praça e comarca de: <strong className="text-slate-200">{note.place || 'Comarca de São Paulo - SP'}</strong>.
            </p>
            {note.notes && (
              <p className="text-xs text-slate-400 font-mono bg-[#111827]/80 p-3 rounded-xl border border-slate-800">
                Averbações contratuais: {note.notes}
              </p>
            )}
          </div>

          {/* Signatures block */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300 relative z-10 font-mono">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Emitente / Devedor Solidário:
              </div>
              <div className="font-bold text-white mt-0.5">{note.debtor}</div>
              {note.debtorDoc && <div className="text-[11px] text-slate-400">{note.debtorDoc}</div>}
              <div className="mt-5 pt-1 border-t border-slate-700 w-48 text-[10px] text-slate-500">
                Assinatura do Emitente / Responsável
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Data de Emissão Cambial:
              </div>
              <div className="font-bold text-white mt-0.5">{formatDate(note.issueDate)}</div>
              <div className="mt-5 pt-1 border-t border-slate-700 w-48 text-[10px] text-slate-500">
                Praça de Compensação Fiduciária
              </div>
            </div>
          </div>
        </div>

        {/* Amortization / Payments Ledger */}
        <div className="p-6 bg-[#0e1424] space-y-4 font-['Inter',sans-serif]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Livro de Amortizações & Protocolos Bancários</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {note.payments.length} {note.payments.length === 1 ? 'lançamento' : 'lançamentos'}
            </span>
          </div>

          {note.payments.length === 0 ? (
            <div className="p-6 text-center bg-[#131b2e] rounded-2xl border border-slate-800 text-slate-400 text-xs font-mono">
              Nenhuma amortização averbada até a presente data. Título integralmente em aberto.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden font-mono">
                <thead className="bg-[#12192b] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Instrumento</th>
                    <th className="p-3">Protocolo / Recibo</th>
                    <th className="p-3">Histórico</th>
                    <th className="p-3 text-right">Amortizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]/70">
                  {note.payments.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-[#12192b]/60">
                      <td className="p-3 text-slate-200">{formatDate(p.date)}</td>
                      <td className="p-3 font-semibold uppercase text-emerald-400">{p.method}</td>
                      <td className="p-3 text-slate-400">{p.authCode || '-'}</td>
                      <td className="p-3 text-slate-300">{p.note || '-'}</td>
                      <td className="p-3 text-right font-black text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Balance Breakdown */}
          <div className="bg-[#12192b] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Total Amortizado</span>
              <span className="text-base font-black text-emerald-400">{formatCurrency(paidAmount)}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Passivo Remanescente</span>
              <span className={`text-base font-black ${isQuitado ? 'text-slate-500 line-through' : 'text-white'}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Índice Resgatado</span>
              <span className="text-base font-black text-emerald-400">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#080c16] border-t border-slate-800 flex items-center justify-between print:hidden font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors cursor-pointer"
              >
                + Amortizar Título
              </button>
              <button
                onClick={() => {
                  onClose();
                  onQuickSettle(note);
                }}
                className="px-4 py-2 bg-[#131b2e] hover:bg-[#1a253f] text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Liquidar Integralmente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
