import React, { useState } from 'react';
import { X, PlusCircle, Building2, User, Calendar, DollarSign, FileText, MapPin, Scale } from 'lucide-react';
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
  const [debtor, setDebtor] = useState('Soluções Empresariais & Manufatura Ltda.');
  const [debtorDoc, setDebtorDoc] = useState('08.723.119/0001-42');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(in30Days);
  const [place, setPlace] = useState('Comarca de São Paulo - SP');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(totalAmount.replace(',', '.'));

    if (!title.trim() || !creditor.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, informe a descrição da obrigação, o beneficiário e o valor nominal.');
      return;
    }

    if (!dueDate) {
      setError('A data de vencimento é indispensável para a validade do título.');
      return;
    }

    setError('');
    onSave({
      code: code.trim() || nextCodeSuggestion,
      title: title.trim(),
      creditor: creditor.trim(),
      creditorDoc: creditorDoc.trim() || undefined,
      debtor: debtor.trim() || 'Soluções Empresariais & Manufatura Ltda.',
      debtorDoc: debtorDoc.trim() || undefined,
      totalAmount: parsedAmount,
      issueDate,
      dueDate,
      place: place.trim() || 'Comarca de São Paulo - SP',
      notes: notes.trim() || 'Título executivo emitido sob as normas da Lei Uniforme de Genebra (Dec. 57.663/66).',
    });

    setTitle('');
    setCreditor('');
    setCreditorDoc('');
    setTotalAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Inter',sans-serif]">
      <div 
        className="bg-[#0e1424] rounded-3xl w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#080c16] text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Space_Grotesk',sans-serif] text-white">
                  Emissão de Nota Promissória
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  TÍTULO EXECUTIVO
                </span>
              </div>
              <p className="text-xs text-slate-400">Formalização de compromisso cambial perante a tesouraria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Código do Título */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Número do Título / Série
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: NP-2026/095"
                className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Valor Nominal */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Valor Nominal Exigível (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
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
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Objeto / Finalidade */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Objeto da Obrigação / Descrição Comercial *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fornecimento de matéria-prima para linha de usinagem"
              className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Credor / Beneficiário + CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Beneficiário / Credor (À ordem de quem pagar) *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={creditor}
                  onChange={(e) => setCreditor(e.target.value)}
                  placeholder="Ex: Petroquímica & Resinas União S.A."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                CNPJ / CPF
              </label>
              <input
                type="text"
                value={creditorDoc}
                onChange={(e) => setCreditorDoc(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Emitente / Devedor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Emitente / Devedor Principal
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={debtor}
                  onChange={(e) => setDebtor(e.target.value)}
                  placeholder="Razão Social da empresa emitente"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                CNPJ Emitente
              </label>
              <input
                type="text"
                value={debtorDoc}
                onChange={(e) => setDebtorDoc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Data de Emissão Cambial
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Vencimento Improrrogável *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Praça de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Praça de Pagamento & Foro de Competência
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ex: Comarca de São Paulo - SP"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Observações / Cláusulas */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Cláusulas Especiais / Vinculação a NF-e ou Contrato
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Vinculado ao Contrato Comercial nº 489/2026 e NF-e nº 008.912..."
              className="w-full px-3.5 py-2 bg-[#131b2e] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar e Emitir Promissória</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
