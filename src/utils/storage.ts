import { DebtAccount, Installment, DashboardSummary } from '../types';

const STORAGE_KEY = 'promissory_pay_accounts_v3';

// --- Geração de parcelas ---
export const generateInstallments = (totalAmount: number, installmentValue: number): Installment[] => {
  if (installmentValue <= 0 || totalAmount <= 0) return [];
  
  const fullInstallments = Math.floor(totalAmount / installmentValue);
  const remainder = Math.round((totalAmount - fullInstallments * installmentValue) * 100) / 100;
  
  const installments: Installment[] = [];

  for (let i = 1; i <= fullInstallments; i++) {
    installments.push({
      id: `inst_${Date.now()}_${i}`,
      number: i,
      originalAmount: installmentValue,
      paidAmount: 0,
      status: 'pendente',
    });
  }

  if (remainder > 0.001) {
    installments.push({
      id: `inst_${Date.now()}_${fullInstallments + 1}`,
      number: fullInstallments + 1,
      originalAmount: Math.round(remainder * 100) / 100,
      paidAmount: 0,
      status: 'pendente',
    });
  }

  return installments;
};

// --- Distribuição de pagamento sequencial nas parcelas ---
export const distributePayment = (
  installments: Installment[],
  paymentAmount: number
): { updatedInstallments: Installment[]; distribution: { installmentNumber: number; amount: number }[] } => {
  let remaining = paymentAmount;
  const distribution: { installmentNumber: number; amount: number }[] = [];
  
  const updated = installments.map((inst) => {
    if (remaining <= 0.001 || inst.status === 'pago') return { ...inst };
    
    const owed = Math.round((inst.originalAmount - inst.paidAmount) * 100) / 100;
    if (owed <= 0.001) return { ...inst, status: 'pago' as const, paidAmount: inst.originalAmount };

    const toApply = Math.min(remaining, owed);
    remaining = Math.round((remaining - toApply) * 100) / 100;

    const newPaid = Math.round((inst.paidAmount + toApply) * 100) / 100;
    const newOwed = Math.round((inst.originalAmount - newPaid) * 100) / 100;

    distribution.push({ installmentNumber: inst.number, amount: toApply });

    return {
      ...inst,
      paidAmount: newPaid,
      status: newOwed <= 0.001 ? ('pago' as const) : ('parcial' as const),
      paidAt: newOwed <= 0.001 ? new Date().toISOString() : inst.paidAt,
    };
  });

  return { updatedInstallments: updated, distribution };
};

// --- Cálculos de status da conta ---
export const calculateAccountFinancials = (account: DebtAccount) => {
  const totalPaid = account.installments.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalRemaining = Math.max(0, Math.round((account.totalAmount - totalPaid) * 100) / 100);
  const progressPercent = account.totalAmount > 0
    ? Math.min(100, Math.round((totalPaid / account.totalAmount) * 100))
    : 100;

  const paidInstallments = account.installments.filter((i) => i.status === 'pago').length;
  const totalInstallments = account.installments.length;
  const pendingInstallments = account.installments.filter((i) => i.status === 'pendente').length;
  const partialInstallments = account.installments.filter((i) => i.status === 'parcial').length;

  let computedStatus: 'em_aberto' | 'parcial' | 'quitado';
  if (totalRemaining <= 0.01) {
    computedStatus = 'quitado';
  } else if (totalPaid > 0.01) {
    computedStatus = 'parcial';
  } else {
    computedStatus = 'em_aberto';
  }

  return {
    totalPaid,
    totalRemaining,
    progressPercent,
    paidInstallments,
    totalInstallments,
    pendingInstallments,
    partialInstallments,
    computedStatus,
  };
};

// --- Dashboard Summary ---
export const calculateDashboardSummary = (accounts: DebtAccount[]): DashboardSummary => {
  let totalOriginal = 0;
  let totalPaid = 0;
  let openCount = 0;
  let partialCount = 0;
  let paidCount = 0;

  accounts.forEach((acc) => {
    totalOriginal += acc.totalAmount;
    const { totalPaid: paid, computedStatus } = calculateAccountFinancials(acc);
    totalPaid += paid;
    if (computedStatus === 'quitado') paidCount++;
    else if (computedStatus === 'parcial') partialCount++;
    else openCount++;
  });

  const totalPending = Math.max(0, Math.round((totalOriginal - totalPaid) * 100) / 100);
  const liquidityRate = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 100;

  return {
    totalOriginal,
    totalPaid,
    totalPending,
    totalAccountsCount: accounts.length,
    openCount,
    partialCount,
    paidCount,
    liquidityRate,
  };
};

// --- Formatação ---
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
    if (year && month && day) return `${day}/${month}/${year}`;
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  } catch {}
  return dateString;
};

// --- Seed Data (Dados de Exemplo) ---
export const SEED_ACCOUNTS: DebtAccount[] = [
  {
    id: 'acc-1',
    code: 'CT-001',
    debtorName: 'Marcos Oliveira',
    debts: [
      { id: 'd1a', name: 'Material de construção', amount: 1200 },
      { id: 'd1b', name: 'Serviço de pintura', amount: 800 },
    ],
    totalAmount: 2000,
    installmentValue: 500,
    installments: [
      { id: 'i1a', number: 1, originalAmount: 500, paidAmount: 500, status: 'pago', paidAt: '2026-09-15T14:00:00Z' },
      { id: 'i1b', number: 2, originalAmount: 500, paidAmount: 300, status: 'parcial' },
      { id: 'i1c', number: 3, originalAmount: 500, paidAmount: 0, status: 'pendente' },
      { id: 'i1d', number: 4, originalAmount: 500, paidAmount: 0, status: 'pendente' },
    ],
    payments: [
      { id: 'p1a', amount: 500, date: '2026-09-15', method: 'pix', note: 'Primeira parcela', registeredAt: '2026-09-15T14:00:00Z' },
      { id: 'p1b', amount: 300, date: '2026-10-05', method: 'dinheiro', note: 'Pagamento parcial', registeredAt: '2026-10-05T10:00:00Z' },
    ],
    status: 'parcial',
    createdAt: '2026-09-01T08:00:00Z',
    notes: 'Reforma do ponto comercial',
  },
  {
    id: 'acc-2',
    code: 'CT-002',
    debtorName: 'Ana Carolina Silva',
    debts: [
      { id: 'd2a', name: 'Compra de tecidos', amount: 950 },
      { id: 'd2b', name: 'Aviamentos e acessórios', amount: 350 },
      { id: 'd2c', name: 'Frete de mercadoria', amount: 200 },
    ],
    totalAmount: 1500,
    installmentValue: 500,
    installments: [
      { id: 'i2a', number: 1, originalAmount: 500, paidAmount: 0, status: 'pendente' },
      { id: 'i2b', number: 2, originalAmount: 500, paidAmount: 0, status: 'pendente' },
      { id: 'i2c', number: 3, originalAmount: 500, paidAmount: 0, status: 'pendente' },
    ],
    payments: [],
    status: 'em_aberto',
    createdAt: '2026-10-10T12:00:00Z',
  },
  {
    id: 'acc-3',
    code: 'CT-003',
    debtorName: 'João Pedro Santos',
    debts: [
      { id: 'd3a', name: 'Peças automotivas', amount: 780 },
    ],
    totalAmount: 780,
    installmentValue: 400,
    installments: [
      { id: 'i3a', number: 1, originalAmount: 400, paidAmount: 400, status: 'pago', paidAt: '2026-09-20T11:00:00Z' },
      { id: 'i3b', number: 2, originalAmount: 380, paidAmount: 380, status: 'pago', paidAt: '2026-10-15T16:00:00Z' },
    ],
    payments: [
      { id: 'p3a', amount: 400, date: '2026-09-20', method: 'pix', note: 'Parcela 1', registeredAt: '2026-09-20T11:00:00Z' },
      { id: 'p3b', amount: 380, date: '2026-10-15', method: 'transferencia', note: 'Quitação', registeredAt: '2026-10-15T16:00:00Z' },
    ],
    status: 'quitado',
    createdAt: '2026-09-05T09:00:00Z',
  },
];

// --- Persistência ---
export const loadAccounts = (): DebtAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveAccounts(SEED_ACCOUNTS);
  return SEED_ACCOUNTS;
};

export const saveAccounts = (accounts: DebtAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
};
