import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
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
      setError('Informe um valor de pagamento válido.');
      return;
    }

    if (parsedAmount > remainingAmount + 0.01) {
      setError(`O valor não pode ultrapassar o saldo restante de ${formatCurrency(remainingAmount)}.`);
      return;
    }

    const finalAuth = authCode.trim() || `PAG-${Date.now().toString().slice(-6)}`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-md shadow-2xl border border-[#262936] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#12141A] p-5 px-6 flex items-center justify-between border-b border-[#262936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Adicionar Pagamento
                </h3>
                <span className="text-[10px] font-mono text-[#11C76F] bg-[#11C76F]/10 border border-[#11C76F]/20 px-1.5 py-0.5 rounded">
                  {note.code}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5]">Amortização ou quitação da conta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Summary Card */}
        <div className="p-5 pb-3 bg-[#12141A] border-b border-[#262936]">
          <div className="text-xs text-[#8B95A5] font-medium">Favorecido:</div>
          <div className="text-sm font-bold text-white truncate mb-2">{note.creditor}</div>

          <div className="grid grid-cols-3 gap-2 bg-[#161821] p-3 rounded-2xl border border-[#262936] text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Total</span>
              <span className="text-xs font-semibold text-white">{formatCurrency(note.totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#11C76F] block">Já Pago</span>
              <span className="text-xs font-bold text-[#11C76F]">{formatCurrency(paidAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Saldo</span>
              <span className="text-xs font-extrabold text-white">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 text-[#FF453A] text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Valor a Pagar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#8B95A5]">
                Valor do Pagamento (R$) *
              </label>
              <span className="text-xs font-semibold text-[#8B95A5]">
                Máx: {formatCurrency(remainingAmount)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-[#8B95A5]">
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
                className="w-full pl-11 pr-4 py-3 bg-[#12141A] border border-[#262936] rounded-xl text-lg font-extrabold text-[#11C76F] focus:outline-none focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F]"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleShortcut(0.25)}
                className="flex-1 py-1.5 text-xs font-bold bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-[#8B95A5] hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(0.5)}
                className="flex-1 py-1.5 text-xs font-bold bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-[#8B95A5] hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleShortcut(1)}
                className="flex-2 py-1.5 text-xs font-extrabold bg-[#11C76F]/10 hover:bg-[#11C76F]/20 border border-[#11C76F]/30 text-[#11C76F] rounded-lg cursor-pointer transition-colors"
              >
                Quitar Saldo ({formatCurrency(remainingAmount)})
              </button>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'transferencia', 'ted_doc', 'dinheiro', 'cartao', 'boleto'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer text-center ${
                    method === m
                      ? 'bg-[#11C76F] text-[#0D0E12]'
                      : 'bg-[#12141A] text-[#8B95A5] hover:text-white border border-[#262936]'
                  }`}
                >
                  {m === 'transferencia' ? 'Transf.' : m === 'ted_doc' ? 'TED' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Data do Pagamento
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#11C76F]"
              />
            </div>
          </div>

          {/* Recibo / Observação */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Comprovante / Observação (Opcional)
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Parcela paga via Pix PicPay"
              className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#262936]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8B95A5] hover:text-white hover:bg-[#1E212D] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] text-xs font-extrabold rounded-xl shadow-[0_2px_12px_rgba(17,199,111,0.2)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
