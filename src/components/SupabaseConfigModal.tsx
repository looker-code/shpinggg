import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  isSupabaseConfigured,
  fetchAccountsFromSupabase
} from '../utils/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

const SQL_SCHEMA = `-- Copie e cole no SQL Editor do Supabase:
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

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura publica" ON public.accounts;
CREATE POLICY "Permitir leitura publica" ON public.accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao publica" ON public.accounts;
CREATE POLICY "Permitir insercao publica" ON public.accounts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao publica" ON public.accounts;
CREATE POLICY "Permitir atualizacao publica" ON public.accounts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao publica" ON public.accounts;
CREATE POLICY "Permitir exclusao publica" ON public.accounts FOR DELETE USING (true);`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      setStatusMessage({ type: 'error', text: 'Por favor, preencha a URL e a Anon Key do Supabase.' });
      return;
    }

    if (!cleanUrl.startsWith('https://')) {
      setStatusMessage({ type: 'error', text: 'A URL do Supabase deve começar com https://' });
      return;
    }

    setIsTesting(true);
    saveSupabaseConfig(cleanUrl, cleanKey);

    try {
      // Tenta consultar a tabela accounts para confirmar conexão e existência da tabela
      await fetchAccountsFromSupabase();
      setStatusMessage({ type: 'success', text: 'Conectado com sucesso ao Supabase! Banco de dados ativo.' });
      setIsTesting(false);
      onConnected();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsTesting(false);
      const msg = err?.message || '';
      if (msg.includes('relation "accounts" does not exist') || msg.includes('404')) {
        setStatusMessage({
          type: 'error',
          text: 'Conectado ao Supabase, mas a tabela "accounts" ainda não foi criada. Execute o SQL abaixo no SQL Editor do Supabase!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Erro de conexão: ${msg || 'Verifique se a URL e a Anon Key estão corretas.'}`,
        });
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#262936] overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#12141A] p-4 sm:p-5 px-6 flex items-center justify-between border-b border-[#262936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Conexão com Banco de Dados (Supabase)
                </h3>
                {isConnected && (
                  <span className="text-[10px] font-bold text-[#11C76F] bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8B95A5]">
                Armazenamento em nuvem permanente (nunca mais perde cadastros)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Instructions */}
        <form onSubmit={handleSaveAndTest} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#11C76F]/10 border-[#11C76F]/30 text-[#11C76F]'
                : 'bg-[#241318] border-[#FF3B30]/30 text-[#FF453A]'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Passo 1 e Passo 2 */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] space-y-2 text-xs">
            <div className="flex items-center justify-between text-white font-bold">
              <span className="flex items-center gap-1.5 text-[#11C76F]">
                <Sparkles className="w-4 h-4" />
                Como conectar seu Supabase em 2 minutos:
              </span>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-[#8B95A5] hover:text-white flex items-center gap-1 underline"
              >
                Abrir Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[#8B95A5]">
              1. Crie um projeto gratuito no Supabase e vá em <strong>Settings &rarr; API</strong>.
            </p>
            <p className="text-[#8B95A5]">
              2. Copie a <strong>Project URL</strong> e a <strong>anon public key</strong> e cole nos campos abaixo.
            </p>
          </div>

          {/* Campo URL */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Project URL do Supabase *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.supabase.co"
              className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white placeholder-[#5F6876] font-mono focus:outline-none focus:border-[#11C76F]"
            />
          </div>

          {/* Campo Anon Key */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Anon Public Key (API Key) *
            </label>
            <input
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-[#12141A] border border-[#262936] rounded-xl text-xs sm:text-sm text-white placeholder-[#5F6876] font-mono focus:outline-none focus:border-[#11C76F]"
            />
          </div>

          {/* Script SQL para criar a tabela */}
          <div className="pt-2 border-t border-[#262936] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Script SQL da Tabela (Execute no Supabase):
              </label>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#1E212D] hover:bg-[#262936] text-[#11C76F] border border-[#11C76F]/25 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-[#11C76F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#12141A] border border-[#262936] rounded-xl text-[11px] text-[#8B95A5] font-mono overflow-x-auto max-h-32 select-all leading-relaxed">
              {SQL_SCHEMA}
            </pre>
            <p className="text-[11px] text-[#8B95A5]">
              No painel do Supabase, clique em <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>, cole este código e clique em <strong>Run</strong>.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-[#262936] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8B95A5] hover:text-white hover:bg-[#1E212D] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="px-5 py-2.5 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Testando Conexão...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar e Conectar Banco</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
