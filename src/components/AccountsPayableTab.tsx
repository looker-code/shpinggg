import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowUpDown, 
  FileQuestion, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
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

        // Filtro de status
        if (statusFilter !== 'todos' && computedStatus !== statusFilter) {
          return false;
        }

        // Filtro de busca textual
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

  // Total do filtro atual
  const filteredTotalRemaining = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const { remainingAmount } = calculateNoteFinancials(note);
      return acc + remainingAmount;
    }, 0);
  }, [filteredNotes]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Contas a Pagar & Promissórias
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerencie cada título, lance parcelas pagas e emita quitação completa.
          </p>
        </div>

        <button
          onClick={onOpenNewAccount}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Promissória</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por favorecido, código (#PROM-...) ou título..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[210px]">
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                <option value="dueDateAsc">Vencimento: mais próximo</option>
                <option value="dueDateDesc">Vencimento: mais distante</option>
                <option value="remainingDesc">Maior Saldo Devedor</option>
                <option value="amountDesc">Maior Valor Nominal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({counts.todos})
          </button>

          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              statusFilter === 'pendente'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>Em Aberto</span>
            <span className="font-extrabold text-[10px]">({counts.pendente})</span>
          </button>

          <button
            onClick={() => setStatusFilter('parcial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              statusFilter === 'parcial'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Parcialmente Pagas</span>
            <span className="font-extrabold text-[10px]">({counts.parcial})</span>
          </button>

          <button
            onClick={() => setStatusFilter('vencido')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              statusFilter === 'vencido'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>Vencidas</span>
            <span className="font-extrabold text-[10px]">({counts.vencido})</span>
          </button>

          <button
            onClick={() => setStatusFilter('quitado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              statusFilter === 'quitado'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Quitadas</span>
            <span className="font-extrabold text-[10px]">({counts.quitado})</span>
          </button>
        </div>
      </div>

      {/* Summary Info Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-medium">
        <span>
          Exibindo <strong className="text-slate-800 font-bold">{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'promissória' : 'promissórias'}
        </span>
        <span>
          Saldo restante filtrado: <strong className="text-slate-900 font-black">{formatCurrency(filteredTotalRemaining)}</strong>
        </span>
      </div>

      {/* Grid of Promissory Cards */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma promissória encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Não encontramos nenhum resultado com os filtros e busca aplicados. Tente limpar os filtros ou cadastre uma nova promissória.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Limpar Filtros
            </button>
            <button
              onClick={onOpenNewAccount}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
            >
              Criar Nova Conta
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
