export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'boleto' | 'ted_doc';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  note?: string;
  authCode?: string; // Código de autenticação bancária / recibo
  registeredAt: string;
}

export type PromissoryStatus = 'pendente' | 'parcial' | 'quitado' | 'vencido';

export interface PromissoryNote {
  id: string;
  code: string; // Ex: NP-2026/041
  title: string; // Operação ou Objeto da Promissória
  creditor: string; // Beneficiário / Credor
  creditorDoc?: string; // CNPJ/CPF do Credor
  debtor: string; // Emitente / Devedor Principal
  debtorDoc?: string; // CNPJ/CPF do Devedor
  totalAmount: number; // Valor Nominal Exigível
  issueDate: string; // Data de Emissão (YYYY-MM-DD)
  dueDate: string; // Data de Vencimento Improrrogável (YYYY-MM-DD)
  place: string; // Praça de Pagamento / Foro
  notes?: string; // Cláusulas, vinculação a NF-e ou contrato
  status: PromissoryStatus;
  payments: PaymentRecord[];
  createdAt: string;
}

export interface DashboardSummary {
  totalOriginal: number;
  totalPaid: number;
  totalPending: number;
  totalNotesCount: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  overdueCount: number;
  liquidityRate: number;
}
