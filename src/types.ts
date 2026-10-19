export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'boleto' | 'ted_doc';

export interface DebtItem {
  id: string;
  name: string;
  amount: number;
}

export interface Installment {
  id: string;
  number: number;
  originalAmount: number;
  paidAmount: number;
  status: 'pendente' | 'pago' | 'parcial';
  paidAt?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
  registeredAt: string;
  // Detalhe de como o pagamento foi distribuído nas parcelas
  distribution?: { installmentNumber: number; amount: number }[];
}

export type AccountStatus = 'em_aberto' | 'parcial' | 'quitado';

export interface DebtAccount {
  id: string;
  code: string;
  debtorName: string;
  debts: DebtItem[];
  totalAmount: number;
  installmentValue: number;
  installments: Installment[];
  payments: PaymentRecord[];
  status: AccountStatus;
  createdAt: string;
  notes?: string;
}

export interface DashboardSummary {
  totalOriginal: number;
  totalPaid: number;
  totalPending: number;
  totalAccountsCount: number;
  openCount: number;
  partialCount: number;
  paidCount: number;
  liquidityRate: number;
}
