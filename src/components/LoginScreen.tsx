import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  FileSpreadsheet, 
  KeyRound, 
  Layers
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.trim().toLowerCase() === 'admin' && password === '123456') ||
      (username.trim() !== '' && password.trim() !== '')
    ) {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background ambient lighting in Emerald & Slate */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Logo Badge */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b101b] rounded-[14px] flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full mb-1">
            Módulo de Tesouraria & Crédito
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white font-['Space_Grotesk',sans-serif]">
            Promissória<span className="text-emerald-400">Pay</span> <span className="text-xs font-normal text-slate-500 uppercase tracking-widest border border-slate-800 rounded px-1.5 py-0.5 ml-1">v2.4</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            Gestão de Títulos Executivos, Amortizações e Quitações
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#0e1424]/90 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-base font-bold text-slate-100 font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Autenticação de Operador</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acesse o livro razão de notas promissórias e contas a pagar
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold text-center animate-shake">
                Credenciais não reconhecidas. Utilize o operador padrão <span className="text-white underline">admin</span> e chave <span className="text-white underline">123456</span>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuário */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Operador / Chave de Acesso
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: admin"
                    className="w-full pl-10 pr-4 py-3 bg-[#131b2e] border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-medium text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Senha Criptografada
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#131b2e] border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm font-medium text-white placeholder-slate-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Credenciais de demonstração */}
              <div className="p-3 bg-[#0a0f1c] rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Acesso pré-configurado:</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded">
                  admin : 123456
                </span>
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>ACESSAR CARTEIRA DE TÍTULOS</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          </div>

          {/* Footer of card */}
          <div className="px-6 py-3.5 bg-[#0a0e19] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Decreto nº 2.044 / LUG
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Livro Razão Criptografado
            </span>
          </div>
        </div>

        {/* Bottom footer text */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          PromissóriaPay Enterprise • Gestão Fiduciária e Registro de Pagamentos
        </p>
      </div>
    </div>
  );
};
