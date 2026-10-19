import React, { useState } from 'react';
import { X, Plus, Building2, User, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
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

  const [code, setCode] = useState(nextCodeSuggestion || 'NP-2026/001');
  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [creditorDoc, setCreditorDoc] = useState('');
  const [debtor, setDebtor] = useState('Minha Empresa / Comércio');
  const [debtorDoc, setDebtorDoc] = useState('08.723.119/0001-42');
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
      setError('Por favor, informe a descrição, o favorecido e o valor da promissória.');
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
      creditorDoc: creditorDoc.trim() || undefined,
      debtor: debtor.trim() || 'Minha Empresa / Comércio',
      debtorDoc: debtorDoc.trim() || undefined,
      totalAmount: parsedAmount,
      issueDate,
      dueDate,
      place: place.trim() || 'São Paulo - SP',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setCreditor('');
    setCreditorDoc('');
    setTotalAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-lg shadow-2xl border border-[#262936] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#12141A] p-5 px-6 flex items-center justify-between border-b border-[#262936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Nova Promissória
              </h3>
              <p className="text-xs text-[#8B95A5]">Cadastro de novo compromisso a pagar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 text-[#FF453A] text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Código */}
            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                Número / Código
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: NP-2026/005"
                className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm font-mono font-bold text-[#11C76F] focus:outline-none focus:border-[#11C76F]"
              />
            </div>

            {/* Valor Nominal */}
            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B95A5]">
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
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#11C76F]"
                />
              </div>
            </div>
          </div>

          {/* Descrição / Título */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Descrição / Finalidade *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Compra de mercadorias para revenda"
              className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F]"
            />
          </div>

          {/* Favorecido / Credor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                Favorecido / Credor *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#11C76F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={creditor}
                  onChange={(e) => setCreditor(e.target.value)}
                  placeholder="Ex: Distribuidora União Ltda"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                CPF / CNPJ
              </label>
              <input
                type="text"
                value={creditorDoc}
                onChange={(e) => setCreditorDoc(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs text-white focus:outline-none focus:border-[#11C76F]"
              />
            </div>
          </div>

          {/* Emitente / Devedor */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Devedor / Emitente
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={debtor}
                onChange={(e) => setDebtor(e.target.value)}
                placeholder="Nome de quem irá pagar"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm text-white focus:outline-none focus:border-[#11C76F]"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#11C76F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-[#11C76F] font-bold focus:outline-none focus:border-[#11C76F]"
              />
            </div>
          </div>

          {/* Praça de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Praça de Pagamento (Cidade / UF)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm text-white focus:outline-none focus:border-[#11C76F]"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Observações / Notas adicionais
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Acordo com desconto para pagamento antecipado..."
              className="w-full px-3.5 py-2 bg-[#12141A] border border-[#262936] rounded-xl text-xs text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#262936]">
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
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Promissória</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
