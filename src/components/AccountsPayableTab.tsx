import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowUpDown, 
  FileQuestion, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  BookOpenCheck,
  BadgePercent
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
    <div className="space-y-6 pb-20 font-['Inter',sans-serif]">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] mb-1">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>CARTEIRA FIDUCIÁRIA</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
            Livro de Promissórias & Títulos Executivos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro cronológico de títulos emitidos, histórico de amortizações parciais e quitações com eficácia executiva.
          </p>
        </div>

        <button
          onClick={onOpenNewAccount}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Emitir Nova Promissória</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1424] p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por credor, código (#NP-...), objeto ou contrato..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[230px]">
              <ArrowUpDown className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 font-mono font-medium focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
              >
                <option value="dueDateAsc">Vencimento: Cronológico Iminente</option>
                <option value="dueDateDesc">Vencimento: Mais Distante</option>
                <option value="remainingDesc">Maior Saldo Devedor</option>
                <option value="amountDesc">Maior Valor Nominal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 hover:bg-[#1a253f] border border-slate-800'
            }`}
          >
            TODAS ({counts.todos})
          </button>

          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pendente'
                ? 'bg-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-[#131b2e] text-blue-400 hover:bg-blue-950/40 border border-blue-500/20'
            }`}
          >
            <span>EM ABERTO</span>
            <span className="font-extrabold text-[10px]">({counts.pendente})</span>
          </button>

          <button
            onClick={() => setStatusFilter('parcial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'parcial'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[#131b2e] text-amber-400 hover:bg-amber-950/40 border border-amber-500/20'
            }`}
          >
            <span>AMORTIZADAS</span>
            <span className="font-extrabold text-[10px]">({counts.parcial})</span>
          </button>

          <button
            onClick={() => setStatusFilter('vencido')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'vencido'
                ? 'bg-rose-500 text-white font-black shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-[#131b2e] text-rose-400 hover:bg-rose-950/40 border border-rose-500/20'
            }`}
          >
            <span>EM MORA</span>
            <span className="font-extrabold text-[10px]">({counts.vencido})</span>
          </button>

          <button
            onClick={() => setStatusFilter('quitado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'quitado'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#131b2e] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20'
            }`}
          >
            <span>LIQUIDADAS</span>
            <span className="font-extrabold text-[10px]">({counts.quitado})</span>
          </button>
        </div>
      </div>

      {/* Summary Info Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
        <span>
          Listando <strong className="text-white font-bold">{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'título executivo' : 'títulos executivos'}
        </span>
        <span>
          Saldo Passivo Filtrado: <strong className="text-emerald-400 font-bold">{formatCurrency(filteredTotalRemaining)}</strong>
        </span>
      </div>

      {/* Grid of Promissory Cards */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[#0e1424] rounded-3xl border border-slate-800 p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 font-['Space_Grotesk',sans-serif]">Nenhum título localizado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Não há registros correspondentes aos critérios de pesquisa ou filtros selecionados.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
              }}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
            >
              Redefinir Filtros
            </button>
            <button
              onClick={onOpenNewAccount}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl cursor-pointer"
            >
              Emitir Nova Promissória
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
