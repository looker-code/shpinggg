import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2,
  Wallet
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
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col items-center justify-center p-4 relative font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#11C76F]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        {/* PicPay Style Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#11C76F] flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(17,199,111,0.25)]">
            <span className="text-[#0D0E12] font-black text-2xl tracking-tighter">P</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
            Promissória<span className="text-[#11C76F]">Pay</span>
          </h1>
          <p className="text-xs text-[#8B95A5] mt-1 font-medium text-center">
            Gestão inteligente de promissórias e títulos a pagar
          </p>
        </div>

        {/* Card Box (PicPay Surface) */}
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-7 shadow-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Acesse sua conta</h2>
            <p className="text-xs text-[#8B95A5] mt-0.5">Informe seu usuário e senha para continuar</p>
          </div>

          {error && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 rounded-xl text-[#FF453A] text-xs font-semibold text-center">
              Usuário ou senha incorretos. Utilize <strong className="text-white">admin</strong> / <strong className="text-white">123456</strong>.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário"
                  className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] focus:ring-1 focus:ring-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B95A5] hover:text-white p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credenciais em destaque PicPay */}
            <div className="p-3 bg-[#1E212D] rounded-xl border border-[#262936] flex items-center justify-between text-xs">
              <span className="text-[#8B95A5]">Acesso demonstrativo:</span>
              <span className="font-mono text-[#11C76F] font-bold bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-lg">
                admin : 123456
              </span>
            </div>

            {/* Botão PicPay Green */}
            <button
              type="submit"
              className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4 text-[#0D0E12] stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#8B95A5] mt-6">
          <ShieldCheck className="w-4 h-4 text-[#11C76F]" />
          <span>Ambiente seguro de controle financeiro</span>
        </div>
      </div>
    </div>
  );
};
