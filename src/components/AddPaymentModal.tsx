import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, CreditCard, FileText, ArrowDownLeft } from 'lucide-react';
import { PromissoryNote, PaymentMethod } from '../types';
import { formatCurrency, calculateNoteFinancials } from '../utils/storage';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: PromissoryNote | null;
  onAddPayment: (
    noteId: string,
    paymentData: { amount: number; date: string; method: PaymentMethod; note?: string; authCode?: string }
  ) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  note,
  onAddPayment,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [noteText, setNoteText] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (note) {
      setAmount('');
      setDate(todayStr);
      setMethod('pix');
      setNoteText('');
      setAuthCode('');
      setError('');
    }
  }, [note, isOpen]);

  if (!isOpen || !note) return null;

  const { paidAmount, remainingAmount } = calculateNoteFinancials(note);

  const handleShortcut = (pct: number) => {
    const val = (remainingAmount * pct).toFixed(2);
    setAmount(val);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor de amortização válido.');
      return;
    }

    if (parsedAmount > remainingAmount + 0.01) {
      setError(`O montante não pode superar o passivo remanescente de ${formatCurrency(remainingAmount)}.`);
      return;
    }

    // Gerar código de recibo automático se não preenchido
    const finalAuth = authCode.trim() || `REC-${Date.now().toString().slice(-6)}`;

    onAddPayment(note.id, {
      amount: parsedAmount,
      date,
      method,
      note: noteText.trim() || undefined,
      authCode: finalAuth,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Inter',sans-serif]">
      <div 
        className="bg-[#0e1424] rounded-3xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#080c16] text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Space_Grotesk',sans-serif] text-white">
                  Averbação de Amortização
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {note.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">Lançamento de pagamento parcial ou quitação em tesouraria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Status Ledger */}
        <div className="p-5 pb-3 bg-[#0a0f1c] border-b border-slate-800">
          <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">Beneficiário do Crédito:</div>
          <div className="text-sm font-bold text-slate-100 truncate mb-2">{note.creditor}</div>

          <div className="grid grid-cols-3 gap-2 bg-[#12192b] p-3 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Nominal</span>
              <span className="text-xs font-mono font-bold text-slate-300">{formatCurrency(note.totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">Amortizado</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(paidAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Saldo Restante</span>
              <span className="text-xs font-mono font-black text-white">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Valor a Amortizar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Montante a Amortizar (R$) *
              </label>
              <span className="text-xs font-mono text-slate-400">
                Máx: {formatCurrency(remainingAmount)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0,00"
                className="w-full pl-11 pr-4 py-3 bg-[#131b2e] border border-slate-800 rounded-xl text-base font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleShortcut(0.25)}
                className="flex-1 py-1.5 text-[11px] font-mono font-bold bg-[#131b2e] hover:bg-[#1a253f] border border-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(0.5)}
                className="flex-1 py-1.5 text-[11px] font-mono font-bold bg-[#131b2e] hover:bg-[#1a253f] border border-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(1)}
                className="flex-2 py-1.5 text-[11px] font-mono font-black bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg cursor-pointer transition-colors"
              >
                Liquidação Integral ({formatCurrency(remainingAmount)})
              </button>
            </div>
          </div>

          {/* Modalidade de Pagamento */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
              Instrumento / Arranjo de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['pix', 'transferencia', 'ted_doc', 'dinheiro', 'cartao', 'boleto'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer text-center ${
                    method === m
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 hover:bg-[#1a253f] border border-slate-800'
                  }`}
                >
                  {m === 'transferencia' ? 'Transf.' : m === 'ted_doc' ? 'TED / DOC' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
              Data Efetiva da Compensação
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Autenticação Bancária / Recibo */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
              Código de Autenticação / Protocolo Bancário (Opcional)
            </label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Ex: TED-889104 ou Chave E2E Pix"
              className="w-full px-3.5 py-2 bg-[#131b2e] border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Observação / Recibo */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
              Termo / Histórico da Amortização
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Amortização parcial acordada via diretoria financeira"
              className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black font-mono rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Averbar Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
