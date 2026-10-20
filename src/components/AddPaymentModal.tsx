import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Calculator,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DebtAccount, PaymentMethod } from '../types';
import { formatCurrency, calculateAccountFinancials, distributePayment } from '../utils/storage';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: DebtAccount | null;
  accounts?: DebtAccount[];
  onOpenNewAccount?: () => void;
  onAddPayment: (
    accountId: string,
    paymentData: { 
      amount: number; 
      date: string; 
      method: PaymentMethod; 
      note?: string;
      installmentNumber?: number;
    }
  ) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  account,
  accounts = [],
  onOpenNewAccount,
  onAddPayment,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  // Modos de pagamento: 'valor' (digitar valor X com recálculo) ou 'parcela' (escolher parcela específica)
  const [payMode, setPayMode] = useState<'valor' | 'parcela'>('valor');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [noteText, setNoteText] = useState<string>('');
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setSelectedAccountId(account.id);
      } else if (accounts.length > 0) {
        // Encontra a primeira conta com saldo restante > 0, ou a primeira da lista
        const accountWithDebt = accounts.find((a) => {
          const fin = calculateAccountFinancials(a);
          return fin.totalRemaining > 0;
        });
        setSelectedAccountId(accountWithDebt ? accountWithDebt.id : accounts[0].id);
      }
      setAmount('');
      setDate(todayStr);
      setMethod('pix');
      setNoteText('');
      setSelectedInstallmentNumber(null);
      setError('');
      setPayMode('valor');
    }
  }, [account, isOpen, accounts, todayStr]);

  if (!isOpen) return null;

  // Conta ativa selecionada
  const activeAccount: DebtAccount | null = 
    (selectedAccountId ? accounts.find((a) => a.id === selectedAccountId) : null) ||
    account ||
    (accounts.length > 0 ? accounts[0] : null);

  // Se não houver nenhuma conta cadastrada no sistema
  if (!activeAccount) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-[#161821] rounded-3xl w-full max-w-md shadow-2xl border border-[#262936] p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1E212D] text-[#8B95A5] flex items-center justify-center mx-auto border border-[#262936]">
            <CreditCard className="w-7 h-7 text-[#11C76F]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Nenhuma Conta Cadastrada</h3>
            <p className="text-xs text-[#8B95A5] mt-1">
              Cadastre primeiro uma conta ou promissória para registrar pagamentos e amortizações.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8B95A5] hover:text-white hover:bg-[#1E212D] transition-colors cursor-pointer"
            >
              Fechar
            </button>
            {onOpenNewAccount && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNewAccount();
                }}
                className="px-5 py-2.5 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Cadastrar Novo Cliente
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const installments = Array.isArray(activeAccount.installments) ? activeAccount.installments : [];
  const { totalPaid, totalRemaining, paidInstallments, totalInstallments } = calculateAccountFinancials(activeAccount);

  // Valor numérico digitado
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;

  // Recálculo do novo saldo restante em tempo real
  const simulatedNewRemaining = Math.max(0, Math.round((totalRemaining - numericAmount) * 100) / 100);
  const simulatedNewPaid = Math.min(activeAccount.totalAmount, Math.round((totalPaid + numericAmount) * 100) / 100);
  const simulatedNewPercent = activeAccount.totalAmount > 0 
    ? Math.min(100, Math.round((simulatedNewPaid / activeAccount.totalAmount) * 100))
    : 100;

  // Simulação detalhada da amortização nas parcelas (cálculo reativo instantâneo)
  const installmentSimulation = (() => {
    if (numericAmount <= 0) return [];

    const { distribution } = distributePayment(
      installments,
      numericAmount,
      selectedInstallmentNumber || undefined
    );

    const distMap = new Map<number, number>();
    distribution.forEach((d) => {
      distMap.set(d.installmentNumber, (distMap.get(d.installmentNumber) || 0) + d.amount);
    });

    return installments.map((inst) => {
      const orig = Number(inst.originalAmount) || 0;
      const currentPaid = Number(inst.paidAmount) || 0;
      const addedAmount = distMap.get(inst.number) || 0;
      const finalPaid = Math.min(orig, Math.round((currentPaid + addedAmount) * 100) / 100);
      const remainsOwed = Math.max(0, Math.round((orig - finalPaid) * 100) / 100);
      const isNowSettled = inst.status === 'pago' || remainsOwed <= 0.001;

      return {
        number: inst.number,
        originalAmount: orig,
        currentPaid,
        addedAmount,
        finalPaid,
        isNowSettled,
        remainsOwed,
      };
    });
  })();

  const affectedInstallments = installmentSimulation
    .filter((sim) => sim.addedAmount > 0)
    .sort((a, b) => b.number - a.number);

  const untouchedCount = installmentSimulation.filter((sim) => sim.addedAmount === 0).length;

  // Última parcela em aberto (para amortização de trás para frente)
  const lastOpenInstallment = [...installments]
    .sort((a, b) => b.number - a.number)
    .find((inst) => inst.status !== 'pago' && inst.paidAmount < inst.originalAmount - 0.001);

  // Selecionar parcela específica para pagar
  const handleSelectInstallment = (inst: any) => {
    const owed = Math.max(0, Math.round((inst.originalAmount - inst.paidAmount) * 100) / 100);
    setAmount(owed.toFixed(2));
    setSelectedInstallmentNumber(inst.number);
    setNoteText(`Pagamento da Parcela ${inst.number}`);
    setError('');
  };

  const handleSetAmount = (val: number) => {
    setAmount(val.toFixed(2));
    setSelectedInstallmentNumber(null);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, digite um valor de pagamento válido.');
      return;
    }

    if (parsedAmount > totalRemaining + 0.01) {
      setError(`O valor não pode ultrapassar o saldo restante de ${formatCurrency(totalRemaining)}.`);
      return;
    }

    setError('');
    onAddPayment(activeAccount.id, {
      amount: parsedAmount,
      date,
      method,
      note: noteText.trim() || (selectedInstallmentNumber ? `Parcela ${selectedInstallmentNumber}` : 'Amortização de parcelas'),
      installmentNumber: selectedInstallmentNumber || undefined,
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#262936] overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com visual PicPay */}
        <div className="bg-[#12141A] p-4 sm:p-5 px-6 flex items-center justify-between border-b border-[#262936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Adicionar Pagamento
                </h3>
                <span className="text-[10px] font-mono text-[#11C76F] bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-full font-bold">
                  {activeAccount.code}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5]">
                Pessoa: <strong className="text-white">{activeAccount.debtorName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Pessoa / Conta se houver mais de uma */}
        {accounts.length > 1 && (
          <div className="px-5 sm:px-6 pt-3 pb-2.5 bg-[#14161F] border-b border-[#262936]">
            <label className="text-[11px] font-bold text-[#8B95A5] block mb-1.5 flex items-center justify-between">
              <span>Selecione o Cliente / Conta a Receber:</span>
              <span className="text-[#11C76F] font-semibold">{accounts.length} contas cadastradas</span>
            </label>
            <select
              value={activeAccount.id}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setAmount('');
                setSelectedInstallmentNumber(null);
                setError('');
              }}
              className="w-full bg-[#0D0E12] border border-[#262936] text-white text-xs sm:text-sm rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-[#11C76F] transition-all cursor-pointer"
            >
              {accounts.map((acc) => {
                const fin = calculateAccountFinancials(acc);
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.debtorName} ({acc.code}) — {fin.totalRemaining > 0 ? `Falta ${formatCurrency(fin.totalRemaining)}` : 'QUITADO'}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Resumo de Saldos */}
        <div className="p-4 sm:p-5 bg-[#12141A]/80 border-b border-[#262936]">
          <div className="grid grid-cols-3 gap-2 bg-[#161821] p-3 rounded-2xl border border-[#262936] text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Dívida Total</span>
              <span className="text-xs sm:text-sm font-semibold text-white">{formatCurrency(activeAccount.totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#11C76F] block">Já Pago</span>
              <span className="text-xs sm:text-sm font-bold text-[#11C76F]">{formatCurrency(totalPaid)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Saldo a Pagar</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>

          {/* Abas de Modo: Amortizar Valor X vs Escolher Parcela */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#12141A] p-1 rounded-xl border border-[#262936] mt-3">
            <button
              type="button"
              onClick={() => {
                setPayMode('valor');
                setSelectedInstallmentNumber(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                payMode === 'valor'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white hover:bg-[#1E212D]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Amortizar Valor (Últimas Parcelas)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPayMode('parcela');
                if (lastOpenInstallment) {
                  handleSelectInstallment(lastOpenInstallment);
                }
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                payMode === 'parcela'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white hover:bg-[#1E212D]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Escolher Parcela</span>
            </button>
          </div>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 text-[#FF453A] text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODO 1: ESCOLHER PARCELA ESPECÍFICA */}
          {payMode === 'parcela' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Selecione a Parcela para Pagar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {installments.map((inst) => {
                  const isSettled = inst.status === 'pago' || inst.paidAmount >= inst.originalAmount - 0.001;
                  const isPartial = inst.status === 'parcial' || (inst.paidAmount > 0 && !isSettled);
                  const owed = Math.max(0, Math.round((inst.originalAmount - inst.paidAmount) * 100) / 100);
                  const isSelected = selectedInstallmentNumber === inst.number;

                  return (
                    <button
                      type="button"
                      key={inst.id}
                      disabled={isSettled}
                      onClick={() => handleSelectInstallment(inst)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSettled
                          ? 'opacity-50 bg-[#12141A] border-[#262936] cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#11C76F]/15 border-[#11C76F] shadow-[0_0_15px_rgba(17,199,111,0.2)]'
                          : 'bg-[#12141A] hover:bg-[#1E212D] border-[#262936]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-white">
                            Parcela {inst.number}
                          </span>
                          {isSettled ? (
                            <span className="text-[9px] font-bold text-[#11C76F] bg-[#11C76F]/10 px-1.5 py-0.2 rounded">
                              Paga ✓
                            </span>
                          ) : isPartial ? (
                            <span className="text-[9px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-1.5 py-0.2 rounded">
                              Parcial
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-[#8B95A5] block mt-0.5">
                          Valor total: {formatCurrency(inst.originalAmount)}
                        </span>
                      </div>

                      <div className="text-right">
                        {!isSettled ? (
                          <>
                            <span className="text-xs font-extrabold text-[#11C76F] block">
                              Pagar {formatCurrency(owed)}
                            </span>
                            {isPartial && (
                              <span className="text-[10px] text-[#8B95A5] block">
                                Já pago: {formatCurrency(inst.paidAmount)}
                              </span>
                            )}
                          </>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#11C76F]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CAMPO DE VALOR X (AMORTIZAÇÃO) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Valor do Pagamento (R$) *
              </label>
              <span className="text-xs text-[#8B95A5]">
                Saldo restante: <strong className="text-white">{formatCurrency(totalRemaining)}</strong>
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
                max={totalRemaining}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedInstallmentNumber(null);
                  setError('');
                }}
                placeholder="0,00"
                className="w-full pl-11 pr-4 py-3 bg-[#12141A] border border-[#262936] rounded-xl text-lg font-extrabold text-[#11C76F] focus:outline-none focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F]"
              />
            </div>

            {/* Indicador de amortização */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#11C76F] mt-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Amortização ativa: o pagamento desconta das últimas parcelas para as primeiras.</span>
            </div>

            {/* Botões de Atalho Rápido */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {lastOpenInstallment && (
                <button
                  type="button"
                  onClick={() => {
                    const owed = Math.max(0, Math.round((lastOpenInstallment.originalAmount - lastOpenInstallment.paidAmount) * 100) / 100);
                    handleSetAmount(owed);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-[#8B95A5] hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  Amortizar P{lastOpenInstallment.number} ({formatCurrency(lastOpenInstallment.originalAmount - lastOpenInstallment.paidAmount)})
                </button>
              )}

              {activeAccount.installmentValue > 0 && activeAccount.installmentValue * 2 <= totalRemaining && (
                <button
                  type="button"
                  onClick={() => handleSetAmount(Math.min(totalRemaining, activeAccount.installmentValue * 2))}
                  className="px-3 py-1.5 text-xs font-bold bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-[#8B95A5] hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  Amortizar 2 Parcelas ({formatCurrency(Math.min(totalRemaining, activeAccount.installmentValue * 2))})
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSetAmount(totalRemaining)}
                className="ml-auto px-3 py-1.5 text-xs font-extrabold bg-[#11C76F]/10 hover:bg-[#11C76F]/20 border border-[#11C76F]/30 text-[#11C76F] rounded-lg cursor-pointer transition-colors"
              >
                Quitar Tudo ({formatCurrency(totalRemaining)})
              </button>
            </div>
          </div>

          {/* PAINEL DE RECÁLCULO EM TEMPO REAL */}
          {numericAmount > 0 && (
            <div className="bg-[#12141A] p-4 rounded-2xl border border-[#11C76F]/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#262936] pb-2">
                <span className="text-xs font-extrabold text-[#11C76F] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulação da Amortização
                </span>
                <span className="text-[11px] font-bold text-white">
                  {simulatedNewPercent}% quitado após este abatimento
                </span>
              </div>

              {/* Comparativo de Saldo */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#161821] p-2.5 rounded-xl border border-[#262936]">
                  <span className="text-[10px] text-[#8B95A5] block">Saldo Atual</span>
                  <span className="font-bold text-white">{formatCurrency(totalRemaining)}</span>
                </div>
                <div className="bg-[#161821] p-2.5 rounded-xl border border-[#262936]">
                  <span className="text-[10px] text-[#11C76F] block">Amortização</span>
                  <span className="font-bold text-[#11C76F]">- {formatCurrency(numericAmount)}</span>
                </div>
                <div className="bg-[#161821] p-2.5 rounded-xl border border-[#262936]">
                  <span className="text-[10px] text-[#8B95A5] block">Novo Saldo</span>
                  <span className="font-extrabold text-white">{formatCurrency(simulatedNewRemaining)}</span>
                </div>
              </div>

              {/* Como as parcelas serão amortizadas */}
              {installmentSimulation.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8B95A5] block">
                      Abatimento nas Parcelas (das últimas para as primeiras):
                    </span>
                    <span className="text-[10px] font-bold text-[#11C76F] bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-full">
                      Amortização de trás p/ frente
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {/* Parcelas que estão recebendo o abatimento, da última para a primeira */}
                    {affectedInstallments.map((sim) => (
                      <div 
                        key={sim.number} 
                        className="p-2.5 rounded-xl border text-xs flex items-center justify-between bg-[#161821] border-[#11C76F]/40 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">Parcela {sim.number}</span>
                          <span className="text-[10px] font-extrabold text-[#11C76F] bg-[#11C76F]/15 border border-[#11C76F]/25 px-2 py-0.5 rounded-md">
                            -{formatCurrency(sim.addedAmount)}
                          </span>
                        </div>

                        <div>
                          {sim.isNowSettled ? (
                            <span className="text-[10px] font-extrabold text-[#11C76F] bg-[#11C76F]/20 px-2.5 py-0.5 rounded-full">
                              Quitada ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#FF9500]">
                              Resta: {formatCurrency(sim.remainsOwed)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Resumo de parcelas iniciais não tocadas */}
                    {untouchedCount > 0 && (
                      <div className="p-2 rounded-xl border border-[#262936] bg-[#12141A] text-[11px] text-[#8B95A5] flex items-center justify-between">
                        <span>
                          {untouchedCount === 1
                            ? '1 parcela inicial permanece intacta (não descontada).'
                            : `${untouchedCount} parcelas iniciais permanecem intactas (não descontadas).`}
                        </span>
                        <span className="text-[10px] text-[#8B95A5] font-mono">
                          (P1{untouchedCount > 1 ? ` a P${untouchedCount}` : ''})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'dinheiro', 'cartao', 'transferencia', 'boleto'] as PaymentMethod[]).map((m) => (
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
                  {m === 'transferencia' ? 'Transf.' : m}
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

          {/* Observação */}
          <div>
            <label className="block text-xs font-semibold text-[#8B95A5] mb-1">
              Observação / Recibo (Opcional)
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Amortização paga via Pix EnablePay"
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
              className="px-5 py-2.5 bg-[#11C76F] hover:bg-[#0EAD60] active:scale-95 text-[#0D0E12] text-xs font-extrabold rounded-xl shadow-[0_2px_12px_rgba(17,199,111,0.2)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                Confirmar Pagamento {numericAmount > 0 ? `(${formatCurrency(numericAmount)})` : ''}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
