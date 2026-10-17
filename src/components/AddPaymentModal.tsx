import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { PromissoryNote, PaymentMethod } from '../types';
import { formatCurrency, calculateNoteFinancials } from '../utils/storage';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: PromissoryNote | null;
  onAddPayment: (noteId: string, paymentData: { amount: number; date: string; method: PaymentMethod; note?: string }) => void;
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
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (note) {
      const { remainingAmount } = calculateNoteFinancials(note);
      // Sugere o saldo restante ou vazio
      setAmount('');
      setDate(todayStr);
      setMethod('pix');
      setNoteText('');
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
      setError('Informe um valor de pagamento válido.');
      return;
    }

    if (parsedAmount > remainingAmount + 0.01) {
      setError(`O valor não pode exceder o saldo restante (${formatCurrency(remainingAmount)}).`);
      return;
    }

    onAddPayment(note.id, {
      amount: parsedAmount,
      date,
      method,
      note: noteText.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center border border-white/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Registrar Pagamento</h3>
              <p className="text-xs text-emerald-100">Amortização da promissória {note.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Summary Card */}
        <div className="p-5 pb-3 bg-slate-50 border-b border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Favorecido:</div>
          <div className="text-sm font-bold text-slate-900 truncate mb-2">{note.creditor}</div>

          <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
              <span className="text-xs font-bold text-slate-700">{formatCurrency(note.totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Já Pago</span>
              <span className="text-xs font-black text-emerald-600">{formatCurrency(paidAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Saldo</span>
              <span className="text-xs font-black text-slate-900">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Valor a Pagar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Valor Pago (R$) *
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Máx: {formatCurrency(remainingAmount)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
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
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleShortcut(0.25)}
                className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(0.5)}
                className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(1)}
                className="flex-2 py-1 text-[11px] font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg cursor-pointer transition-colors"
              >
                Quitar Total ({formatCurrency(remainingAmount)})
              </button>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'dinheiro', 'transferencia', 'cartao', 'boleto', 'outro'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer text-center ${
                    method === m
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Data do Pagamento
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Comentário / Recibo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Observação / Recibo (Opcional)
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Parcela 2 de 4 paga via chave Pix celular"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
