import { DebtAccount, Installment, DashboardSummary } from '../types';

const STORAGE_KEY = 'promissory_pay_accounts_v4';

// --- Geração segura de parcelas ---
export const generateInstallments = (totalAmount: number, installmentValue: number): Installment[] => {
  const total = Math.max(0, Number(totalAmount) || 0);
  const instVal = Math.max(0, Number(installmentValue) || 0);

  if (total <= 0) return [];
  if (instVal <= 0 || instVal >= total) {
    return [
      {
        id: `inst_${Date.now()}_1`,
        number: 1,
        originalAmount: total,
        paidAmount: 0,
        status: 'pendente',
      },
    ];
  }

  const fullInstallments = Math.floor(total / instVal);
  const remainder = Math.round((total - fullInstallments * instVal) * 100) / 100;

  const installments: Installment[] = [];

  for (let i = 1; i <= fullInstallments; i++) {
    installments.push({
      id: `inst_${Date.now()}_${i}`,
      number: i,
      originalAmount: instVal,
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

// --- Sanitizador de contas (Garante que nunca haja undefined ou crash) ---
export const sanitizeAccount = (raw: any): DebtAccount => {
  const totalAmount = Math.max(0, Number(raw?.totalAmount) || 0);
  const installmentValue = Math.max(0, Number(raw?.installmentValue) || totalAmount || 1);
  const debts = Array.isArray(raw?.debts)
    ? raw.debts.map((d: any, idx: number) => ({
        id: String(d?.id || `d_${idx}`),
        name: String(d?.name || `Conta ${idx + 1}`),
        amount: Math.max(0, Number(d?.amount) || 0),
      }))
    : [];

  let installments: Installment[] = [];
  if (Array.isArray(raw?.installments) && raw.installments.length > 0) {
    installments = raw.installments.map((inst: any, idx: number) => {
      const orig = Math.max(0, Number(inst?.originalAmount) || 0);
      const paid = Math.max(0, Number(inst?.paidAmount) || 0);
      let status: 'pendente' | 'pago' | 'parcial' = 'pendente';
      if (paid >= orig - 0.001 && orig > 0) status = 'pago';
      else if (paid > 0.001) status = 'parcial';

      return {
        id: String(inst?.id || `inst_${Date.now()}_${idx + 1}`),
        number: Number(inst?.number) || idx + 1,
        originalAmount: orig,
        paidAmount: paid,
        status: inst?.status || status,
        paidAt: inst?.paidAt,
      };
    });
  } else {
    installments = generateInstallments(totalAmount, installmentValue);
  }

  const payments = Array.isArray(raw?.payments)
    ? raw.payments.map((p: any, idx: number) => ({
        id: String(p?.id || `p_${idx}`),
        amount: Math.max(0, Number(p?.amount) || 0),
        date: String(p?.date || new Date().toISOString().split('T')[0]),
        method: p?.method || 'pix',
        note: p?.note || '',
        registeredAt: p?.registeredAt || new Date().toISOString(),
        distribution: Array.isArray(p?.distribution) ? p.distribution : [],
      }))
    : [];

  return {
    id: String(raw?.id || `acc_${Date.now()}`),
    code: String(raw?.code || 'CT-001'),
    debtorName: String(raw?.debtorName || 'Sem Nome'),
    debts,
    totalAmount,
    installmentValue,
    installments,
    payments,
    status: raw?.status || 'em_aberto',
    createdAt: String(raw?.createdAt || new Date().toISOString()),
    notes: raw?.notes || '',
  };
};

// --- Distribuição de pagamento sequencial nas parcelas ---
export const distributePayment = (
  installments: Installment[],
  paymentAmount: number
): { updatedInstallments: Installment[]; distribution: { installmentNumber: number; amount: number }[] } => {
  let remaining = Math.max(0, Number(paymentAmount) || 0);
  const distribution: { installmentNumber: number; amount: number }[] = [];
  const safeInsts = Array.isArray(installments) ? installments : [];

  const updated = safeInsts.map((inst) => {
    if (remaining <= 0.001 || inst.status === 'pago') return { ...inst };

    const owed = Math.max(0, Math.round((inst.originalAmount - inst.paidAmount) * 100) / 100);
    if (owed <= 0.001) {
      return { ...inst, status: 'pago' as const, paidAmount: inst.originalAmount };
    }

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
  const safeAccount = account || { totalAmount: 0, installments: [] };
  const installments = Array.isArray(safeAccount.installments) ? safeAccount.installments : [];
  
  const totalPaid = installments.reduce((sum, i) => sum + (Number(i?.paidAmount) || 0), 0);
  const totalAmount = Math.max(0, Number(safeAccount.totalAmount) || 0);
  const totalRemaining = Math.max(0, Math.round((totalAmount - totalPaid) * 100) / 100);
  const progressPercent = totalAmount > 0
    ? Math.min(100, Math.round((totalPaid / totalAmount) * 100))
    : 100;

  const paidInstallments = installments.filter((i) => i?.status === 'pago').length;
  const totalInstallments = installments.length;
  const pendingInstallments = installments.filter((i) => i?.status === 'pendente').length;
  const partialInstallments = installments.filter((i) => i?.status === 'parcial').length;

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

  const safeList = Array.isArray(accounts) ? accounts : [];

  safeList.forEach((acc) => {
    const safe = sanitizeAccount(acc);
    totalOriginal += safe.totalAmount;
    const { totalPaid: paid, computedStatus } = calculateAccountFinancials(safe);
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
    totalAccountsCount: safeList.length,
    openCount,
    partialCount,
    paidCount,
    liquidityRate,
  };
};

// --- Formatação ---
export const formatCurrency = (value: number): string => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(num);
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

// --- Seed Data com contas realistas ---
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
      { id: 'p1b', amount: 300, date: '2026-10-05', method: 'dinheiro', note: 'Pagamento parcial P2', registeredAt: '2026-10-05T10:00:00Z' },
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
      { id: 'p3b', amount: 380, date: '2026-10-15', method: 'transferencia', note: 'Quitação final', registeredAt: '2026-10-15T16:00:00Z' },
    ],
    status: 'quitado',
    createdAt: '2026-09-05T09:00:00Z',
  },
];

// --- Persistência Segura ---
export const loadAccounts = (): DebtAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeAccount);
      }
    }
  } catch {}
  
  // Tenta migrar da chave v3 caso exista
  try {
    const rawV3 = localStorage.getItem('promissory_pay_accounts_v3');
    if (rawV3) {
      const parsedV3 = JSON.parse(rawV3);
      if (Array.isArray(parsedV3) && parsedV3.length > 0) {
        const sanitized = parsedV3.map(sanitizeAccount);
        saveAccounts(sanitized);
        return sanitized;
      }
    }
  } catch {}

  const defaultList = SEED_ACCOUNTS.map(sanitizeAccount);
  saveAccounts(defaultList);
  return defaultList;
};

export const saveAccounts = (accounts: DebtAccount[]): void => {
  try {
    const safe = Array.isArray(accounts) ? accounts.map(sanitizeAccount) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {}
};
