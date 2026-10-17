import React, { useState } from 'react';
import { X, PlusCircle, Building2, User, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
import { PromissoryNote } from '../types';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Omit<PromissoryNote, 'id' | 'payments' | 'createdAt' | 'status'>) => void;
  nextCodeSuggestion: string;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextCodeSuggestion,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [code, setCode] = useState(nextCodeSuggestion || 'PROM-001');
  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [debtor, setDebtor] = useState('Minha Empresa / Comércio');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(in30Days);
  const [place, setPlace] = useState('São Paulo - SP');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(totalAmount.replace(',', '.'));

    if (!title.trim() || !creditor.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, preencha o título, o favorecido e um valor válido.');
      return;
    }

    if (!dueDate) {
      setError('A data de vencimento é obrigatória.');
      return;
    }

    setError('');
    onSave({
      code: code.trim() || nextCodeSuggestion,
      title: title.trim(),
      creditor: creditor.trim(),
      debtor: debtor.trim() || 'Minha Empresa',
      totalAmount: parsedAmount,
      issueDate,
      dueDate,
      place: place.trim(),
      notes: notes.trim(),
    });

    // Reset fields
    setTitle('');
    setCreditor('');
    setTotalAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Nova Conta / Promissória</h3>
              <p className="text-xs text-slate-400">Emissão de novo compromisso a pagar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Código da Promissória */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Número / Código
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PROM-005"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Valor Nominal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Título / Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Descrição / Finalidade *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Compra de matéria-prima para estoque"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Favorecido / Credor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Favorecido / Credor (Quem irá receber) *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="Ex: Distribuidora Silva & Filhos Ltda"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Devedor / Emitente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Emitente / Devedor (Quem pagará)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={debtor}
                onChange={(e) => setDebtor(e.target.value)}
                placeholder="Ex: Minha Empresa / Comércio"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Datas: Emissão e Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Praça de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Praça de Pagamento (Local)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Observações / Notas adicionais
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Acordo verbal com 5% de desconto caso quitado antes do vencimento..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
              <PlusCircle className="w-4 h-4" />
              <span>Salvar Promissória</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
