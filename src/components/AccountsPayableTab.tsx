import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  FileQuestion, 
  Plus,
  CreditCard 
} from 'lucide-react';
import { DebtAccount } from '../types';
import { PromissoryCard } from './PromissoryCard';
import { calculateAccountFinancials, formatCurrency } from '../utils/storage';

interface AccountsPayableTabProps {
  accounts: DebtAccount[];
  onOpenNewAccount: () => void;
  onOpenGeneralPaymentModal: () => void;
  onOpenPaymentModal: (account: DebtAccount) => void;
  onOpenDetailsModal: (account: DebtAccount) => void;
  onQuickSettle: (account: DebtAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsPayableTab: React.FC<AccountsPayableTabProps> = ({
  accounts,
  onOpenNewAccount,
  onOpenGeneralPaymentModal,
  onOpenPaymentModal,
  onOpenDetailsModal,
  onQuickSettle,
  onDeleteAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'em_aberto' | 'parcial' | 'quitado'>('todos');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'remainingDesc' | 'amountDesc'>('remainingDesc');

  // Contadores para os filtros
  const counts = useMemo(() => {
    let em_aberto = 0;
    let parcial = 0;
    let quitado = 0;

    accounts.forEach((acc) => {
      const { computedStatus } = calculateAccountFinancials(acc);
      if (computedStatus === 'quitado') quitado++;
      else if (computedStatus === 'parcial') parcial++;
      else em_aberto++;
    });

    return {
      todos: accounts.length,
      em_aberto,
      parcial,
      quitado,
    };
  }, [accounts]);

  // Lista filtrada e ordenada
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((account) => {
        const { computedStatus } = calculateAccountFinancials(account);

        if (statusFilter !== 'todos' && computedStatus !== statusFilter) {
          return false;
        }

        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchCode = account.code.toLowerCase().includes(term);
          const matchName = account.debtorName.toLowerCase().includes(term);
          const matchDebts = account.debts.some((d) => d.name.toLowerCase().includes(term));
          if (!matchCode && !matchName && !matchDebts) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const finA = calculateAccountFinancials(a);
        const finB = calculateAccountFinancials(b);

        if (sortBy === 'nameAsc') {
          return a.debtorName.localeCompare(b.debtorName);
        }
        if (sortBy === 'amountDesc') {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === 'remainingDesc') {
          return finB.totalRemaining - finA.totalRemaining;
        }
        return 0;
      });
  }, [accounts, searchTerm, statusFilter, sortBy]);

  const filteredTotalRemaining = useMemo(() => {
    return filteredAccounts.reduce((acc, account) => {
      const { totalRemaining } = calculateAccountFinancials(account);
      return acc + totalRemaining;
    }, 0);
  }, [filteredAccounts]);

  return (
    <div className="space-y-6 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Contas a Pagar por Pessoa
          </h2>
          <p className="text-xs sm:text-sm text-[#8B95A5] mt-0.5">
            Gerencie dívidas por pessoa, acompanhe as parcelas em aberto e registre amortizações
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={onOpenGeneralPaymentModal}
            className="bg-[#11C76F] hover:bg-[#0EAD60] active:scale-95 text-[#0D0E12] font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(17,199,111,0.25)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            title="Adicionar pagamento ou amortização"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Pagamento</span>
          </button>

          <button
            onClick={onOpenNewAccount}
            className="bg-[#1E212D] hover:bg-[#262936] active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl border border-[#262936] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#161821] p-4 sm:p-5 rounded-3xl border border-[#262936] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome da pessoa, conta ou código..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-sm text-white placeholder-[#5F6876] focus:outline-none focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F] transition-all font-medium"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[210px]">
              <ArrowUpDown className="w-4 h-4 text-[#8B95A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-[#11C76F] cursor-pointer appearance-none"
              >
                <option value="remainingDesc">Maior Saldo Devedor</option>
                <option value="amountDesc">Maior Dívida Total</option>
                <option value="nameAsc">Ordem Alfabética (Nome)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-[#11C76F] text-[#0D0E12]'
                : 'bg-[#1E212D] text-[#8B95A5] hover:text-white border border-[#262936]'
            }`}
          >
            Todas ({counts.todos})
          </button>

          <button
            onClick={() => setStatusFilter('em_aberto')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'em_aberto'
                ? 'bg-[#11C76F] text-[#0D0E12]'
                : 'bg-[#1E212D] text-[#8B95A5] hover:text-white border border-[#262936]'
            }`}
          >
            <span>Em Aberto</span>
            <span className="text-[10px] opacity-80">({counts.em_aberto})</span>
          </button>

          <button
            onClick={() => setStatusFilter('parcial')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'parcial'
                ? 'bg-[#11C76F] text-[#0D0E12]'
                : 'bg-[#1E212D] text-[#8B95A5] hover:text-white border border-[#262936]'
            }`}
          >
            <span>Parcialmente Pagas</span>
            <span className="text-[10px] opacity-80">({counts.parcial})</span>
          </button>

          <button
            onClick={() => setStatusFilter('quitado')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'quitado'
                ? 'bg-[#11C76F] text-[#0D0E12]'
                : 'bg-[#1E212D] text-[#11C76F] border border-[#11C76F]/20'
            }`}
          >
            <span>Quitadas</span>
            <span className="text-[10px] opacity-80">({counts.quitado})</span>
          </button>
        </div>
      </div>

      {/* Summary Info Bar */}
      <div className="flex items-center justify-between text-xs text-[#8B95A5] px-2 font-medium">
        <span>
          Mostrando <strong className="text-white font-bold">{filteredAccounts.length}</strong> {filteredAccounts.length === 1 ? 'pessoa' : 'pessoas'}
        </span>
        <span>
          Saldo restante filtrado: <strong className="text-[#11C76F] font-bold">{formatCurrency(filteredTotalRemaining)}</strong>
        </span>
      </div>

      {/* Grid of Accounts */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-12 text-center">
          <FileQuestion className="w-12 h-12 text-[#5F6876] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma conta encontrada</h3>
          <p className="text-xs text-[#8B95A5] max-w-sm mx-auto mt-1">
            Não encontramos nenhum resultado com os filtros selecionados.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
              }}
              className="px-4 py-2 text-xs font-bold text-[#8B95A5] bg-[#1E212D] hover:text-white rounded-xl cursor-pointer"
            >
              Limpar Filtros
            </button>
            <button
              onClick={onOpenNewAccount}
              className="px-4 py-2 text-xs font-bold text-[#0D0E12] bg-[#11C76F] hover:bg-[#0EAD60] rounded-xl cursor-pointer"
            >
              Adicionar Conta
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <PromissoryCard
              key={account.id}
              account={account}
              onOpenPaymentModal={onOpenPaymentModal}
              onOpenDetailsModal={onOpenDetailsModal}
              onQuickSettle={onQuickSettle}
              onDeleteAccount={onDeleteAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
};
