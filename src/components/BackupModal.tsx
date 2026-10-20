import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Database, 
  AlertCircle, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { DebtAccount } from '../types';
import { sanitizeAccount, isSeedAccount } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: DebtAccount[];
  onRestoreAccounts: (accounts: DebtAccount[]) => void;
  onClearDemoData?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onRestoreAccounts,
  onClearDemoData,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  if (!isOpen) return null;

  const realAccounts = accounts.filter((a) => !isSeedAccount(a));
  const hasDemoAccounts = accounts.some((a) => isSeedAccount(a));

  const handleCopyCurrentData = () => {
    try {
      const exportData = JSON.stringify(accounts, null, 2);
      navigator.clipboard.writeText(exportData);
      setCopied(true);
      setSuccess('Dados copiados para a área de transferência!');
      setTimeout(() => {
        setCopied(false);
        setSuccess('');
      }, 3000);
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione e copie manualmente.');
    }
  };

  const handleDownloadJson = () => {
    try {
      const exportData = JSON.stringify(accounts, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enablepay_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Arquivo de backup baixado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao gerar arquivo de download.');
    }
  };

  const handleImportJson = () => {
    setError('');
    setSuccess('');

    if (!jsonText.trim()) {
      setError('Por favor, cole o texto do backup ou JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      let listToImport: DebtAccount[] = [];

      if (Array.isArray(parsed)) {
        listToImport = parsed.map(sanitizeAccount);
      } else if (parsed && typeof parsed === 'object') {
        // Se foi colado um único registro de conta
        listToImport = [sanitizeAccount(parsed)];
      } else {
        throw new Error('Formato inválido.');
      }

      // Remove sementes de exemplo
      listToImport = listToImport.filter((a) => !isSeedAccount(a));

      if (listToImport.length === 0) {
        setError('Nenhum cadastro válido encontrado no conteúdo colado.');
        return;
      }

      onRestoreAccounts(listToImport);
      setSuccess(`${listToImport.length} ${listToImport.length === 1 ? 'cadastro restaurado' : 'cadastros restaurados'} com sucesso!`);
      setJsonText('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('Conteúdo inválido. Certifique-se de colar o JSON completo copiado do seu backup.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#161821] rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#262936] overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#12141A] p-4 sm:p-5 px-6 flex items-center justify-between border-b border-[#262936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11C76F]/10 text-[#11C76F] border border-[#11C76F]/20 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Backup e Restauração de Dados
              </h3>
              <p className="text-xs text-[#8B95A5]">
                Migre ou salve seus cadastros com facilidade
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 text-[#FF453A] text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#11C76F]/10 border border-[#11C76F]/30 text-[#11C76F] text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Banner Explicativo sobre a mudança de domínio */}
          <div className="bg-[#12141A] p-4 rounded-2xl border border-[#262936] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#11C76F]">
              <Sparkles className="w-4 h-4" />
              <span>Mudou de domínio na Vercel?</span>
            </div>
            <p className="text-xs text-[#8B95A5] leading-relaxed">
              O navegador armazena seus dados no <strong className="text-white">armazenamento local (localStorage)</strong> de cada link específico. Se você preencheu um cadastro no domínio anterior, ele ainda está salvo no seu navegador lá!
            </p>
            <div className="bg-[#161821] p-3 rounded-xl border border-[#262936] text-[11px] text-slate-300 space-y-1">
              <strong className="text-white block font-semibold">Como resgatar em 3 passos:</strong>
              <div>1. Abra o link do domínio antigo no navegador onde você cadastrou.</div>
              <div>2. Pressione <kbd className="bg-[#1E212D] px-1.5 py-0.5 rounded text-white font-mono">F12</kbd> &rarr; aba <strong>Console</strong>.</div>
              <div>
                3. Digite: <code className="text-[#11C76F] font-mono select-all">copy(localStorage.getItem('promissory_pay_accounts_v4') || localStorage.getItem('enablepay_accounts_v1'))</code> e dê Enter.
              </div>
              <div className="text-[#8B95A5] pt-0.5">Depois, basta colar o texto no campo abaixo e clicar em <strong>Restaurar</strong>!</div>
            </div>
          </div>

          {/* Seção 1: Importar / Restaurar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Restaurar / Colar Backup (JSON)
            </label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Cole aqui os dados do backup em formato JSON...'
              className="w-full p-3 bg-[#12141A] border border-[#262936] rounded-xl text-xs text-white placeholder-[#5F6876] font-mono focus:outline-none focus:border-[#11C76F]"
            />
            <button
              type="button"
              onClick={handleImportJson}
              className="w-full py-2.5 bg-[#11C76F] hover:bg-[#0EAD60] text-[#0D0E12] font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Restaurar e Carregar Cadastros</span>
            </button>
          </div>

          {/* Seção 2: Exportar Atual */}
          <div className="pt-2 border-t border-[#262936] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Exportar Backup do EnablePay
              </label>
              <span className="text-[11px] text-[#8B95A5]">
                {realAccounts.length} {realAccounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyCurrentData}
                className="py-2.5 px-3 bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-[#11C76F]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Dados'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="py-2.5 px-3 bg-[#1E212D] hover:bg-[#262936] border border-[#262936] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Baixar .json</span>
              </button>
            </div>
          </div>

          {/* Seção 3: Remover Contas de Exemplo se existirem */}
          {hasDemoAccounts && onClearDemoData && (
            <div className="pt-2 border-t border-[#262936] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Registros de Demonstração</span>
                <span className="text-[11px] text-[#8B95A5]">Exclui Marcos, Ana e João Pedro da lista</span>
              </div>
              <button
                type="button"
                onClick={onClearDemoData}
                className="px-3 py-1.5 bg-[#241318] hover:bg-[#341820] text-[#FF453A] border border-[#FF3B30]/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Exemplos</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#12141A] border-t border-[#262936] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#8B95A5] hover:text-white hover:bg-[#1E212D] rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
