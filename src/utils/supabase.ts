import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DebtAccount } from '../types';
import { sanitizeAccount } from './storage';

const STORAGE_SUPABASE_URL = 'enablepay_supabase_url';
const STORAGE_SUPABASE_KEY = 'enablepay_supabase_key';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_KEY) || '' : '';

  return {
    url: (envUrl || storedUrl).trim(),
    key: (envKey || storedKey).trim(),
  };
};

export const saveSupabaseConfig = (url: string, key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_KEY, key.trim());
  }
};

let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    clientInstance = null;
    return null;
  }

  if (clientInstance && lastUrl === config.url && lastKey === config.key) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(config.url, config.key, {
      auth: {
        persistSession: false,
      },
    });
    lastUrl = config.url;
    lastKey = config.key;
    return clientInstance;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key && config.url.startsWith('https://'));
};

// Conversão do formato do banco para o DebtAccount do app
const mapDbToAccount = (row: any): DebtAccount => {
  return sanitizeAccount({
    id: row.id,
    code: row.code,
    debtorName: row.debtor_name || row.debtorName,
    debts: Array.isArray(row.debts) ? row.debts : [],
    totalAmount: Number(row.total_amount) || Number(row.totalAmount) || 0,
    installmentValue: Number(row.installment_value) || Number(row.installmentValue) || 0,
    installments: Array.isArray(row.installments) ? row.installments : [],
    payments: Array.isArray(row.payments) ? row.payments : [],
    status: row.status || 'em_aberto',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    notes: row.notes || '',
  });
};

// Conversão do DebtAccount para a linha do banco
const mapAccountToDb = (acc: DebtAccount) => {
  return {
    id: acc.id,
    code: acc.code,
    debtor_name: acc.debtorName,
    debts: acc.debts,
    total_amount: acc.totalAmount,
    installment_value: acc.installmentValue,
    installments: acc.installments,
    payments: acc.payments,
    status: acc.status,
    notes: acc.notes || '',
    created_at: acc.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// --- Operações CRUD no Supabase ---

export const fetchAccountsFromSupabase = async (): Promise<DebtAccount[]> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await client
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) return [];
  return data.map(mapDbToAccount);
};

export const saveAccountToSupabase = async (account: DebtAccount): Promise<void> => {
  const client = getSupabaseClient();
  if (!client) return;

  const row = mapAccountToDb(account);
  const { error } = await client
    .from('accounts')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao salvar conta no Supabase:', error);
    throw error;
  }
};

export const deleteAccountFromSupabase = async (id: string): Promise<void> => {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar conta no Supabase:', error);
    throw error;
  }
};
