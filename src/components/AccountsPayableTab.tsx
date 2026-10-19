import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  FileQuestion, 
  Plus, 
  Filter
} from 'lucide-react';
import { PromissoryNote } from '../types';
import { PromissoryCard } from './PromissoryCard';
import { calculateNoteFinancials, formatCurrency } from '../utils/storage';

interface AccountsPayableTabProps {
  notes: PromissoryNote[];
  onOpenNewAccount: () => void;
  onOpenPaymentModal: (note: PromissoryNote) => void;
  onOpenDetailsModal: (note: PromissoryNote) => void;
  onQuickSettle: (note: PromissoryNote) => void;
  onDeleteNote: (id: string) => void;
}

export const AccountsPayableTab: React.FC<AccountsPayableTabProps> = ({
  notes,
  onOpenNewAccount,
  onOpenPaymentModal,
  onOpenDetailsModal,
  onQuickSettle,
  onDeleteNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'parcial' | 'quitado' | 'vencido'>('todos');
  const [sortBy, setSortBy] = useState<'dueDateAsc' | 'dueDateDesc' | 'amountDesc' | 'remainingDesc'>('dueDateAsc');

  // Contadores para os filtros
  const counts = useMemo(() => {
    let pendente = 0;
    let parcial = 0;
    let quitado = 0;
    let vencido = 0;

    notes.forEach((n) => {
      const { computedStatus } = calculateNoteFinancials(n);
      if (computedStatus === 'quitado') quitado++;
      else if (computedStatus === 'vencido') vencido++;
      else if (computedStatus === 'parcial') parcial++;
      else pendente++;
    });

    return {
      todos: notes.length,
      pendente,
      parcial,
      quitado,
      vencido,
    };
  }, [notes]);

  // Lista filtrada e ordenada
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const { computedStatus } = calculateNoteFinancials(note);

        if (statusFilter !== 'todos' && computedStatus !== statusFilter) {
          return false;
        }

        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchCode = note.code.toLowerCase().includes(term);
          const matchTitle = note.title.toLowerCase().includes(term);
          const matchCreditor = note.creditor.toLowerCase().includes(term);
          const matchDebtor = note.debtor.toLowerCase().includes(term);
          if (!matchCode && !matchTitle && !matchCreditor && !matchDebtor) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const finA = calculateNoteFinancials(a);
        const finB = calculateNoteFinancials(b);

        if (sortBy === 'dueDateAsc') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'dueDateDesc') {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'amountDesc') {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === 'remainingDesc') {
          return finB.remainingAmount - finA.remainingAmount;
        }
        return 0;
      });
  }, [notes, searchTerm, statusFilter, sortBy]);

  const filteredTotalRemaining = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const { remainingAmount } = calculateNoteFinancials(note);
      return acc + remainingAmount;
    }, 0);
  }, [filteredNotes]);

  return (
    <div className="space-y-6 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Contas a Pagar & Promissórias
          </h2>
          <p className="text-xs sm:text-sm text-[#8B95A5] mt-0.5">
            Gerencie cada promissória, realize amortizações e acompanhe o histórico de quitação
          </p>
        </div>

        <button
          onClick={onOpenNewAccount}
          className="bg-[#11C76F] hover:bg-[#0EAD60] active:scale-95 text-[#0D0E12] font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(17,199,111,0.2)] flex items-center justify-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Promissória</span>
        </button>
      </div>

      {/* Filter & Search Bar (PicPay Surface) */}
      <div className="bg-[#161821] p-4 sm:p-5 rounded-3xl border border-[#262936] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por credor, código (#NP-...), descrição..."
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
                <option value="dueDateAsc">Vencimento: mais próximo</option>
                <option value="dueDateDesc">Vencimento: mais distante</option>
                <option value="remainingDesc">Maior Saldo Devedor</option>
                <option value="amountDesc">Maior Valor Total</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips (PicPay Pills) */}
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
            onClick={() => setStatusFilter('pendente')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pendente'
                ? 'bg-[#11C76F] text-[#0D0E12]'
                : 'bg-[#1E212D] text-[#8B95A5] hover:text-white border border-[#262936]'
            }`}
          >
            <span>Em Aberto</span>
            <span className="text-[10px] opacity-80">({counts.pendente})</span>
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
            onClick={() => setStatusFilter('vencido')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'vencido'
                ? 'bg-[#FF3B30] text-white'
                : 'bg-[#1E212D] text-[#FF453A] border border-[#FF3B30]/20'
            }`}
          >
            <span>Vencidas</span>
            <span className="text-[10px] opacity-80">({counts.vencido})</span>
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
          Mostrando <strong className="text-white font-bold">{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'promissória' : 'promissórias'}
        </span>
        <span>
          Saldo restante filtrado: <strong className="text-[#11C76F] font-bold">{formatCurrency(filteredTotalRemaining)}</strong>
        </span>
      </div>

      {/* Grid of Promissory Cards */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-12 text-center">
          <FileQuestion className="w-12 h-12 text-[#5F6876] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma promissória encontrada</h3>
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
              Cadastrar Nova
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <PromissoryCard
              key={note.id}
              note={note}
              onOpenPaymentModal={onOpenPaymentModal}
              onOpenDetailsModal={onOpenDetailsModal}
              onQuickSettle={onQuickSettle}
              onDeleteNote={onDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
