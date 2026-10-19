import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, User, Calculator, ArrowRight, Check } from 'lucide-react';
import { DebtAccount, DebtItem } from '../types';
import { formatCurrency, generateInstallments } from '../utils/storage';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: {
    debtorName: string;
    debts: DebtItem[];
    totalAmount: number;
    installmentValue: number;
    notes?: string;
  }) => void;
  nextCodeSuggestion: string;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [debtorName, setDebtorName] = useState('');
  const [debts, setDebts] = useState<{ id: string; name: string; amount: string }[]>([
    { id: '1', name: '', amount: '' },
  ]);
  const [hasNegotiation, setHasNegotiation] = useState(true);
  const [installmentValueInput, setInstallmentValueInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Total da soma das contas
  const totalAmount = useMemo(() => {
    return debts.reduce((sum, d) => {
      const val = parseFloat(d.amount.replace(',', '.')) || 0;
      return sum + (val > 0 ? val : 0);
    }, 0);
  }, [debts]);

  // Valor da parcela escolhido
  const installmentValue = useMemo(() => {
    if (!hasNegotiation) return totalAmount;
    const val = parseFloat(installmentValueInput.replace(',', '.'));
    return val > 0 ? val : 0;
  }, [hasNegotiation, installmentValueInput, totalAmount]);

  // Simulação de parcelas em tempo real
  const previewInstallments = useMemo(() => {
    if (totalAmount <= 0) return [];
    if (!hasNegotiation) {
      return [{ number: 1, amount: totalAmount }];
    }
    if (installmentValue <= 0) return [];

    const fullCount = Math.floor(totalAmount / installmentValue);
    const remainder = Math.round((totalAmount - fullCount * installmentValue) * 100) / 100;
    const list: { number: number; amount: number; isLastShorter?: boolean }[] = [];

    for (let i = 1; i <= fullCount; i++) {
      list.push({ number: i, amount: installmentValue });
    }

    if (remainder > 0.001) {
      list.push({ number: fullCount + 1, amount: remainder, isLastShorter: true });
    }

    return list;
  }, [totalAmount, installmentValue, hasNegotiation]);

  if (!isOpen) return null;

  const handleAddDebtRow = () => {
    setDebts((prev) => [...prev, { id: String(Date.now()), name: '', amount: '' }]);
  };

  const handleRemoveDebtRow = (id: string) => {
    if (debts.length === 1) return;
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDebtChange = (id: string, field: 'name' | 'amount', value: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!debtorName.trim()) {
      setError('Informe o nome da pessoa da conta.');
      return;
    }

    const validDebts = debts
      .map((d) => ({
        id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: d.name.trim(),
        amount: parseFloat(d.amount.replace(',', '.')) || 0,
      }))
      .filter((d) => d.name && d.amount > 0);

    if (validDebts.length === 0) {
      setError('Adicione pelo menos uma conta com nome e valor válido.');
      return;
    }

    if (totalAmount <= 0) {
      setError('O valor total da dívida deve ser maior que zero.');
      return;
    }

    const finalInstallmentVal = hasNegotiation && installmentValue > 0 ? installmentValue : totalAmount;

    setError('');
    onSave({
      debtorName: debtorName.trim(),
      debts: validDebts,
      totalAmount,
      installmentValue: finalInstallmentVal,
      notes: notes.trim() || undefined,
    });

    // Reset
    setDebtorName('');
    setDebts([{ id: '1', name: '', amount: '' }]);
    setInstallmentValueInput('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-xl shadow-2xl border border-[#262936] overflow-hidden flex flex-col max-h-[92vh]"
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
                Adicionar Conta / Dívida
              </h3>
              <p className="text-xs text-[#8B95A5]">Cadastre os valores em aberto e configure a negociação</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 text-[#FF453A] text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* 1. Nome da pessoa da conta */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Nome da Pessoa da Conta *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
                placeholder="Ex: João da Silva, Maria Santos..."
                className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] rounded-xl text-sm font-semibold text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F]"
              />
            </div>
          </div>

          {/* 2. Valores em Aberto (Lista dinâmica de contas) */}
          <div className="space-y-3 pt-2 border-t border-[#262936]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Valores em Aberto (Itens da Dívida)
              </label>
              <span className="text-xs text-[#8B95A5]">
                {debts.length} {debts.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="space-y-2.5">
              {debts.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleDebtChange(item.id, 'name', e.target.value)}
                      placeholder={`Nome da conta ${idx + 1} (ex: Aluguel, Mercado, Peças)`}
                      className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F]"
                    />
                  </div>
                  <div className="w-32 sm:w-36 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B95A5]">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleDebtChange(item.id, 'amount', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#11C76F]"
                    />
                  </div>
                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDebtRow(item.id)}
                      className="p-2 text-[#8B95A5] hover:text-[#FF453A] hover:bg-[#241318] rounded-xl transition-colors cursor-pointer"
                      title="Remover conta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Botão + para adicionar mais contas */}
            <button
              type="button"
              onClick={handleAddDebtRow}
              className="w-full py-2.5 bg-[#1E212D] hover:bg-[#262936] border border-dashed border-[#262936] hover:border-[#11C76F]/50 text-[#11C76F] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Mais Uma Conta</span>
            </button>
          </div>

          {/* 3. Abaixo a Soma de Contas */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] flex items-center justify-between">
            <span className="text-xs font-bold text-[#8B95A5] uppercase tracking-wider">
              Soma Total das Contas:
            </span>
            <span className="text-xl font-extrabold text-[#11C76F]">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* 4. Opção de Negociação */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="toggle-negotiation" 
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  hasNegotiation 
                    ? 'bg-[#11C76F] border-[#11C76F] text-[#0D0E12]' 
                    : 'bg-[#161821] border-[#262936]'
                }`}>
                  {hasNegotiation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Opção de Negociação (Parcelamento)
                  </span>
                  <span className="text-[11px] text-[#8B95A5]">
                    Definir valor fixo de parcelas para pagamento
                  </span>
                </div>
              </label>
              <input
                id="toggle-negotiation"
                type="checkbox"
                checked={hasNegotiation}
                onChange={(e) => setHasNegotiation(e.target.checked)}
                className="sr-only"
              />
            </div>

            {hasNegotiation && (
              <div className="pt-3 border-t border-[#262936] space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
                    Valor das Parcelas (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B95A5]">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={installmentValueInput}
                      onChange={(e) => setInstallmentValueInput(e.target.value)}
                      placeholder="Ex: 500,00"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#161821] border border-[#262936] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#11C76F]"
                    />
                  </div>
                </div>

                {/* Resumo do Parcelamento em Tempo Real */}
                {totalAmount > 0 && installmentValue > 0 && (
                  <div className="bg-[#161821] p-3.5 rounded-xl border border-[#262936] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#8B95A5]">Quantidade de Parcelas:</span>
                      <span className="text-white font-bold">{previewInstallments.length}x</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#8B95A5]">Total em Aberto:</span>
                      <span className="text-[#11C76F] font-bold">{formatCurrency(totalAmount)}</span>
                    </div>

                    {/* Lista das parcelas calculadas */}
                    <div className="pt-2 border-t border-[#262936] space-y-1 max-h-36 overflow-y-auto">
                      {previewInstallments.map((p) => (
                        <div key={p.number} className="flex items-center justify-between text-[11px]">
                          <span className="text-[#8B95A5]">
                            Parcela {p.number} {p.isLastShorter ? '(última parcela quebrada)' : ''}
                          </span>
                          <span className={`font-bold ${p.isLastShorter ? 'text-[#FF9500]' : 'text-white'}`}>
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações opcionais */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Contato via WhatsApp, combinado pagar todo dia 10..."
              className="w-full px-3.5 py-2 bg-[#12141A] border border-[#262936] rounded-xl text-xs text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F]"
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
              <span>Cadastrar Conta & Dívida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
