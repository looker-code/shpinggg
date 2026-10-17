export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'boleto' | 'outro';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD ou data/hora formatada
  method: PaymentMethod;
  note?: string;
  registeredAt: string;
}

export type PromissoryStatus = 'pendente' | 'parcial' | 'quitado' | 'vencido';

export interface PromissoryNote {
  id: string;
  code: string; // Ex: PROM-001
  title: string; // Descrição ou finalidade
  creditor: string; // Favorecido / Beneficiário
  debtor: string; // Emitente / Devedor
  totalAmount: number; // Valor nominal
  issueDate: string; // Data de emissão (YYYY-MM-DD)
  dueDate: string; // Data de vencimento (YYYY-MM-DD)
  place?: string; // Praça de pagamento (ex: São Paulo - SP)
  notes?: string; // Observações adicionais
  status: PromissoryStatus;
  payments: PaymentRecord[];
  createdAt: string;
}

export interface AccountFilter {
  search: string;
  status: 'todos' | 'pendente' | 'parcial' | 'quitado' | 'vencido';
  sortBy: 'dueDate' | 'totalAmount' | 'remaining' | 'createdAt';
  sortOrder: 'asc' | 'desc';
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
}
