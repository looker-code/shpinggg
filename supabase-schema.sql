-- ========================================================
-- ENABLEPAY: Script de Criação do Banco de Dados (Supabase)
-- ========================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Criação da tabela de contas/dívidas
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  debtor_name TEXT NOT NULL,
  debts JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  installment_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'em_aberto',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso para a anon key (acesso direto do app)
DROP POLICY IF EXISTS "Permitir leitura publica" ON public.accounts;
CREATE POLICY "Permitir leitura publica" ON public.accounts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao publica" ON public.accounts;
CREATE POLICY "Permitir insercao publica" ON public.accounts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao publica" ON public.accounts;
CREATE POLICY "Permitir atualizacao publica" ON public.accounts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao publica" ON public.accounts;
CREATE POLICY "Permitir exclusao publica" ON public.accounts
  FOR DELETE USING (true);

-- 4. Habilita Realtime na tabela accounts (para atualização instantânea em múltiplas abas)
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
