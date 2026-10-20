import { DebtAccount, Installment, DashboardSummary } from '../types';

const STORAGE_KEY = 'enablepay_accounts_v1';
const LEGACY_V4_KEY = 'promissory_pay_accounts_v4';

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
  let debts = Array.isArray(raw?.debts)
    ? raw.debts.map((d: any, idx: number) => ({
        id: String(d?.id || `d_${idx}`),
        name: String(d?.name || `Conta ${idx + 1}`),
        amount: Math.max(0, Number(d?.amount) || 0),
      }))
    : [];

  if (debts.length === 0 && totalAmount > 0) {
    debts = [{ id: `d_${Date.now()}`, name: String(raw?.title || 'Dívida Principal'), amount: totalAmount }];
  }

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
    debtorName: String(raw?.debtorName || raw?.debtor || raw?.title || 'Sem Nome'),
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

// --- Distribuição de pagamento amortizado (das ÚLTIMAS parcelas para as primeiras) ---
export const distributePayment = (
  installments: Installment[],
  paymentAmount: number,
  targetInstallmentNumber?: number
): { updatedInstallments: Installment[]; distribution: { installmentNumber: number; amount: number }[] } => {
  let remaining = Math.max(0, Number(paymentAmount) || 0);
  const distribution: { installmentNumber: number; amount: number }[] = [];
  const safeInsts: Installment[] = Array.isArray(installments)
    ? installments.map((i) => ({ ...i }))
    : [];

  // Se o usuário selecionou uma parcela específica no modal (ex: pelo modo 'Escolher Parcela')
  if (targetInstallmentNumber !== undefined && targetInstallmentNumber !== null) {
    const target = safeInsts.find((i) => i.number === targetInstallmentNumber);
    if (target && target.status !== 'pago') {
      const orig = Math.max(0, Number(target.originalAmount) || 0);
      const paid = Math.max(0, Number(target.paidAmount) || 0);
      const owed = Math.max(0, Math.round((orig - paid) * 100) / 100);

      if (owed > 0.001) {
        const toApply = Math.min(remaining, owed);
        remaining = Math.round((remaining - toApply) * 100) / 100;

        const newPaid = Math.round((paid + toApply) * 100) / 100;
        const newOwed = Math.max(0, Math.round((orig - newPaid) * 100) / 100);

        target.paidAmount = newPaid;
        target.status = newOwed <= 0.001 ? 'pago' : 'parcial';
        if (newOwed <= 0.001 && !target.paidAt) {
          target.paidAt = new Date().toISOString();
        }

        distribution.push({ installmentNumber: target.number, amount: toApply });
      }
    }
  }

  // Amortização: desconta das ÚLTIMAS parcelas para as primeiras (ordem decrescente pelo número da parcela)
  if (remaining > 0.001) {
    const sortedDesc = [...safeInsts].sort((a, b) => (b.number || 0) - (a.number || 0));

    for (const inst of sortedDesc) {
      if (remaining <= 0.001) break;

      const orig = Math.max(0, Number(inst.originalAmount) || 0);
      const paid = Math.max(0, Number(inst.paidAmount) || 0);
      const owed = Math.max(0, Math.round((orig - paid) * 100) / 100);

      if (owed <= 0.001 || inst.status === 'pago') {
        continue;
      }

      const toApply = Math.min(remaining, owed);
      remaining = Math.round((remaining - toApply) * 100) / 100;

      const newPaid = Math.round((paid + toApply) * 100) / 100;
      const newOwed = Math.max(0, Math.round((orig - newPaid) * 100) / 100);

      inst.paidAmount = newPaid;
      inst.status = newOwed <= 0.001 ? 'pago' : 'parcial';
      if (newOwed <= 0.001 && !inst.paidAt) {
        inst.paidAt = new Date().toISOString();
      }

      distribution.push({ installmentNumber: inst.number, amount: toApply });
    }
  }

  return { updatedInstallments: safeInsts, distribution };
};

// --- Recalcula todas as parcelas de uma conta aplicando os pagamentos como amortização (das últimas) ---
export const recalculateAccountFromPayments = (account: DebtAccount): DebtAccount => {
  const safeAccount = sanitizeAccount(account);
  const baseInstallments = generateInstallments(safeAccount.totalAmount, safeAccount.installmentValue);
  
  let currentInsts = baseInstallments;
  const updatedPayments = (safeAccount.payments || []).map((p) => {
    const { updatedInstallments, distribution } = distributePayment(currentInsts, p.amount);
    currentInsts = updatedInstallments;
    return {
      ...p,
      distribution,
    };
  });

  const { computedStatus } = calculateAccountFinancials({
    ...safeAccount,
    installments: currentInsts,
  });

  return {
    ...safeAccount,
    installments: currentInsts,
    payments: updatedPayments,
    status: computedStatus,
  };
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

// --- Identificador de contas de demonstração antigas ---
export const isSeedAccount = (acc: any): boolean => {
  if (!acc) return false;
  return (
    acc.id === 'acc-1' ||
    acc.id === 'acc-2' ||
    acc.id === 'acc-3' ||
    acc.debtorName === 'Marcos Oliveira' ||
    acc.debtorName === 'Ana Carolina Silva' ||
    acc.debtorName === 'João Pedro Santos'
  );
};

// --- Seed Data limpa (não insere dados aleatórios) ---
export const SEED_ACCOUNTS: DebtAccount[] = [];

// --- Persistência Segura ---
export const loadAccounts = (): DebtAccount[] => {
  const tryParseAndClean = (raw: string | null): DebtAccount[] | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Remove quaisquer contas de exemplo que possam ter sido injetadas anteriormente
        const cleaned = parsed.filter((a) => !isSeedAccount(a));
        if (cleaned.length > 0) {
          return cleaned.map(sanitizeAccount);
        }
        // Se a lista continha unicamente as contas de exemplo, limpa do storage
        return [];
      }
    } catch {}
    return null;
  };

  // 1. Tenta carregar pela chave atual do EnablePay
  const current = tryParseAndClean(localStorage.getItem(STORAGE_KEY));
  if (current !== null) {
    saveAccounts(current);
    return current;
  }

  // 2. Tenta migrar da chave v4 (PromissóriaPay)
  const legacyV4 = tryParseAndClean(localStorage.getItem(LEGACY_V4_KEY));
  if (legacyV4 !== null) {
    saveAccounts(legacyV4);
    return legacyV4;
  }
  
  // 3. Tenta migrar da chave v3 caso exista
  const legacyV3 = tryParseAndClean(localStorage.getItem('promissory_pay_accounts_v3'));
  if (legacyV3 !== null) {
    saveAccounts(legacyV3);
    return legacyV3;
  }

  // 4. Tenta migrar da base antiga de promissórias se existir
  const legacyNotes = tryParseAndClean(localStorage.getItem('promissory_notes_db'));
  if (legacyNotes !== null) {
    saveAccounts(legacyNotes);
    return legacyNotes;
  }

  saveAccounts([]);
  return [];
};

export const saveAccounts = (accounts: DebtAccount[]): void => {
  try {
    const safe = Array.isArray(accounts) ? accounts.map(sanitizeAccount) : [];
    const json = JSON.stringify(safe);
    localStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem(LEGACY_V4_KEY, json);
  } catch {}
};
