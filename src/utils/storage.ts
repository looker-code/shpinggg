import { PromissoryNote, DashboardSummary } from '../types';

const STORAGE_KEY = 'promissory_notes_corporate_db_v2';

export const SEED_NOTES: PromissoryNote[] = [
  {
    id: 'np-2026-001',
    code: 'NP-2026/089',
    title: 'Cédula de Crédito Mercantil - Fornecimento de Polímeros & Resinas',
    creditor: 'Petroquímica & Resinas União S.A.',
    creditorDoc: '14.892.451/0001-88',
    debtor: 'Soluções Empresariais & Manufatura Ltda.',
    debtorDoc: '08.723.119/0001-42',
    totalAmount: 18500.0,
    issueDate: '2026-09-01',
    dueDate: '2026-11-15',
    place: 'Comarca de São Paulo - SP',
    notes: 'Título executivo emitido sob a égide do Decreto nº 2.044/1908 e Lei Uniforme de Genebra (Dec. nº 57.663/66). Vinculado à NF-e nº 008.912.',
    status: 'parcial',
    createdAt: '2026-09-01T08:00:00.000Z',
    payments: [
      {
        id: 'pay-001-1',
        amount: 6500.0,
        date: '2026-09-20',
        method: 'transferencia',
        note: '1ª Amortização ordinária de tesouraria',
        authCode: 'TED-89410294-BCB',
        registeredAt: '2026-09-20T14:30:00.000Z',
      },
      {
        id: 'pay-001-2',
        amount: 4000.0,
        date: '2026-10-05',
        method: 'pix',
        note: '2ª Amortização extraordinária via arranjo instantâneo',
        authCode: 'E18236128202610051600a9f81',
        registeredAt: '2026-10-05T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'np-2026-002',
    code: 'NP-2026/074',
    title: 'Contrato de Modernização Estrutural e Engenharia Térmica',
    creditor: 'Aliança Engenharia & Climatização Industrial Ltda.',
    creditorDoc: '22.304.918/0001-15',
    debtor: 'Soluções Empresariais & Manufatura Ltda.',
    debtorDoc: '08.723.119/0001-42',
    totalAmount: 9400.0,
    issueDate: '2026-08-10',
    dueDate: '2026-10-10',
    place: 'Comarca de Campinas - SP',
    notes: 'Termo de quitação plena, geral e irrevogável emitido pelo credor após cumprimento integral da obrigação.',
    status: 'quitado',
    createdAt: '2026-08-10T09:30:00.000Z',
    payments: [
      {
        id: 'pay-002-1',
        amount: 4700.0,
        date: '2026-09-10',
        method: 'transferencia',
        note: 'Entrada formal de mobilização técnica',
        authCode: 'TED-77192831-BCB',
        registeredAt: '2026-09-10T11:00:00.000Z',
      },
      {
        id: 'pay-002-2',
        amount: 4700.0,
        date: '2026-10-09',
        method: 'pix',
        note: 'Liquidação e resgate definitivo do título',
        authCode: 'E18236128202610091715b7e23',
        registeredAt: '2026-10-09T17:15:00.000Z',
      },
    ],
  },
  {
    id: 'np-2026-003',
    code: 'NP-2026/092',
    title: 'Financiamento Operacional de Centro de Usinagem CNC',
    creditor: 'TecnoMáquinas Brasil Importação & Distribuição S.A.',
    creditorDoc: '03.491.820/0001-99',
    debtor: 'Soluções Empresariais & Manufatura Ltda.',
    debtorDoc: '08.723.119/0001-42',
    totalAmount: 32000.0,
    issueDate: '2026-10-01',
    dueDate: '2026-12-20',
    place: 'Comarca de São Paulo - SP',
    notes: 'Garantia vinculada com cláusula de reserva de domínio sobre equipamento modelo CNC-Pro 5X.',
    status: 'pendente',
    createdAt: '2026-10-01T08:30:00.000Z',
    payments: [],
  },
  {
    id: 'np-2026-004',
    code: 'NP-2026/065',
    title: 'Fornecimento Contratual de Matéria-Prima Metálica e Perfis',
    creditor: 'Siderúrgica & Perfis São Bento Ltda.',
    creditorDoc: '61.492.381/0001-04',
    debtor: 'Soluções Empresariais & Manufatura Ltda.',
    debtorDoc: '08.723.119/0001-42',
    totalAmount: 7800.0,
    issueDate: '2026-08-25',
    dueDate: '2026-10-05',
    place: 'Comarca de Santo André - SP',
    notes: 'Título vencido em aberto com notificação extrajudicial em curso. Sujeito à cláusula penal de 2% ao mês.',
    status: 'parcial',
    createdAt: '2026-08-25T13:20:00.000Z',
    payments: [
      {
        id: 'pay-004-1',
        amount: 2500.0,
        date: '2026-09-15',
        method: 'cartao',
        note: 'Amortização de boa-fé em balcão',
        authCode: 'AUT-6619028',
        registeredAt: '2026-09-15T15:00:00.000Z',
      },
    ],
  },
];

export const loadPromissoryNotes = (): PromissoryNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler base corporativa', err);
  }
  savePromissoryNotes(SEED_NOTES);
  return SEED_NOTES;
};

export const savePromissoryNotes = (notes: PromissoryNote[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Erro ao persistir base corporativa', err);
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('T')[0].split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
  } catch {}
  return dateString;
};

export interface NoteFinancials {
  paidAmount: number;
  remainingAmount: number;
  progressPercent: number;
  isOverdue: boolean;
  computedStatus: 'pendente' | 'parcial' | 'quitado' | 'vencido';
}

export const calculateNoteFinancials = (note: PromissoryNote): NoteFinancials => {
  const paidAmount = (note.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);
  const remainingAmount = Math.max(0, note.totalAmount - paidAmount);
  const progressPercent = note.totalAmount > 0 
    ? Math.min(100, Math.round((paidAmount / note.totalAmount) * 100)) 
    : 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = remainingAmount > 0.001 && note.dueDate < todayStr;

  let computedStatus: 'pendente' | 'parcial' | 'quitado' | 'vencido';
  if (remainingAmount <= 0.001) {
    computedStatus = 'quitado';
  } else if (isOverdue) {
    computedStatus = 'vencido';
  } else if (paidAmount > 0) {
    computedStatus = 'parcial';
  } else {
    computedStatus = 'pendente';
  }

  return {
    paidAmount,
    remainingAmount,
    progressPercent,
    isOverdue,
    computedStatus,
  };
};

export const calculateDashboardSummary = (notes: PromissoryNote[]): DashboardSummary => {
  let totalOriginal = 0;
  let totalPaid = 0;
  let pendingCount = 0;
  let partialCount = 0;
  let paidCount = 0;
  let overdueCount = 0;

  notes.forEach((note) => {
    totalOriginal += note.totalAmount;
    const { paidAmount, computedStatus } = calculateNoteFinancials(note);
    totalPaid += paidAmount;

    if (computedStatus === 'quitado') paidCount++;
    else if (computedStatus === 'vencido') overdueCount++;
    else if (computedStatus === 'parcial') partialCount++;
    else pendingCount++;
  });

  const totalPending = Math.max(0, totalOriginal - totalPaid);
  const liquidityRate = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 100;

  return {
    totalOriginal,
    totalPaid,
    totalPending,
    totalNotesCount: notes.length,
    pendingCount,
    partialCount,
    paidCount,
    overdueCount,
    liquidityRate,
  };
};
