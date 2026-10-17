import { PromissoryNote, DashboardSummary } from '../types';

const STORAGE_KEY = 'promissory_notes_db';

export const SEED_NOTES: PromissoryNote[] = [
  {
    id: 'prom-1',
    code: 'PROM-001',
    title: 'Fornecedor de Mercadorias - Distribuidora União',
    creditor: 'Distribuidora União Ltda',
    debtor: 'Minha Empresa / Comércio',
    totalAmount: 4500.0,
    issueDate: '2026-09-10',
    dueDate: '2026-10-30',
    place: 'São Paulo - SP',
    notes: 'Nota promissória referente à remessa de produtos do mês 09. Parcelamento acordado.',
    status: 'parcial',
    createdAt: '2026-09-10T10:00:00.000Z',
    payments: [
      {
        id: 'pay-1-1',
        amount: 1500.0,
        date: '2026-09-25',
        method: 'pix',
        note: '1ª Amortização via Pix',
        registeredAt: '2026-09-25T14:30:00.000Z',
      },
      {
        id: 'pay-1-2',
        amount: 1000.0,
        date: '2026-10-10',
        method: 'transferencia',
        note: '2ª Amortização parcial',
        registeredAt: '2026-10-10T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'prom-2',
    code: 'PROM-002',
    title: 'Reforma e Pintura do Ponto Comercial',
    creditor: 'Manoel Silva Empreiteira',
    debtor: 'Minha Empresa / Comércio',
    totalAmount: 2800.0,
    issueDate: '2026-08-15',
    dueDate: '2026-10-15',
    place: 'São Paulo - SP',
    notes: 'Promissória do serviço de alvenaria e pintura.',
    status: 'quitado',
    createdAt: '2026-08-15T09:00:00.000Z',
    payments: [
      {
        id: 'pay-2-1',
        amount: 1400.0,
        date: '2026-09-15',
        method: 'pix',
        note: 'Entrada 50%',
        registeredAt: '2026-09-15T11:00:00.000Z',
      },
      {
        id: 'pay-2-2',
        amount: 1400.0,
        date: '2026-10-14',
        method: 'pix',
        note: 'Quitação final na entrega do serviço',
        registeredAt: '2026-10-14T17:15:00.000Z',
      },
    ],
  },
  {
    id: 'prom-3',
    code: 'PROM-003',
    title: 'Aquisição de Máquinas e Equipamentos',
    creditor: 'Indústria MaqSul S.A.',
    debtor: 'Minha Empresa / Comércio',
    totalAmount: 6200.0,
    issueDate: '2026-10-01',
    dueDate: '2026-11-20',
    place: 'São Paulo - SP',
    notes: 'Garantia vinculada à nota promissória nº 003.',
    status: 'pendente',
    createdAt: '2026-10-01T08:30:00.000Z',
    payments: [],
  },
  {
    id: 'prom-4',
    code: 'PROM-004',
    title: 'Gráfica e Embalagens Personalizadas',
    creditor: 'ArteBox Embalagens',
    debtor: 'Minha Empresa / Comércio',
    totalAmount: 1250.0,
    issueDate: '2026-09-01',
    dueDate: '2026-10-05',
    place: 'São Paulo - SP',
    notes: 'Lote de 5.000 sacolas e caixas.',
    status: 'parcial',
    createdAt: '2026-09-01T13:20:00.000Z',
    payments: [
      {
        id: 'pay-4-1',
        amount: 500.0,
        date: '2026-09-10',
        method: 'cartao',
        note: 'Sinal de confirmação',
        registeredAt: '2026-09-10T15:00:00.000Z',
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
    console.error('Erro ao ler localStorage', err);
  }
  // Se não existir, salva o seed e retorna
  savePromissoryNotes(SEED_NOTES);
  return SEED_NOTES;
};

export const savePromissoryNotes = (notes: PromissoryNote[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Erro ao salvar no localStorage', err);
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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

  // Checar se está vencida (se não quitada e dueDate < hoje)
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = remainingAmount > 0 && note.dueDate < todayStr;

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

  return {
    totalOriginal,
    totalPaid,
    totalPending,
    totalNotesCount: notes.length,
    pendingCount,
    partialCount,
    paidCount,
    overdueCount,
  };
};
