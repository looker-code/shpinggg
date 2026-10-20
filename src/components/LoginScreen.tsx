import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Briefcase,
  AtSign,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { 
  registerUser,
  loginUser,
  BUSINESS_TYPES,
  UserProfile 
} from '../utils/auth';

interface LoginScreenProps {
  onLogin: (user?: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Modos principais: 'login' | 'cadastro'
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('cadastro');

  // Campos do formulário
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [businessType, setBusinessType] = useState<string>('Varejo / Loja Física');
  const [customBusinessType, setCustomBusinessType] = useState('');

  // Campos de login
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Criar Conta Direta (Sem confirmação de e-mail) ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await registerUser({
        fullName,
        username,
        password,
        businessType,
        customBusinessType,
      });

      setIsLoading(false);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao criar conta. Tente novamente.');
    }
  };

  // --- Entrar no Sistema ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginUser(loginUsername, loginPassword);
      setIsLoading(false);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao realizar login.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col items-center justify-center p-4 relative font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#11C76F] selection:text-[#0D0E12]">
      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-[#11C76F]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* EnablePay Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#11C76F] flex items-center justify-center mb-3 shadow-[0_8px_24px_rgba(17,199,111,0.25)]">
            <span className="text-[#0D0E12] font-black text-2xl tracking-tighter">E</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
            Enable<span className="text-[#11C76F]">Pay</span>
          </h1>
          <p className="text-xs text-[#8B95A5] mt-1 font-medium text-center">
            Gestão inteligente de promissórias, amortizações e títulos a pagar
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-[#161821] rounded-3xl border border-[#262936] p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Seletor: Criar Conta vs Entrar */}
          <div className="grid grid-cols-2 gap-1 bg-[#12141A] p-1 rounded-xl border border-[#262936]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('cadastro');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'cadastro'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white'
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Mensagens de Erro */}
          {errorMessage && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 rounded-xl text-[#FF453A] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 1: CRIAR CONTA (SEM CONFIRMAÇÃO)                     */}
          {/* ======================================================== */}
          {authMode === 'cadastro' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Souza"
                    className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
                  />
                </div>
              </div>

              {/* Nome de Usuário */}
              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  Nome de Usuário <span className="text-[#5F6876] font-normal">(para login)</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="ex: carlossouza ou lojadocarlos"
                    className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-mono text-white placeholder-[#5F6876] outline-none"
                  />
                </div>
              </div>

              {/* Senha */}
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
                    placeholder="Crie uma senha segura"
                    className="w-full pl-10 pr-11 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
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

              {/* List Box: Tipo de Negócio */}
              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  Tipo de Negócio
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white outline-none cursor-pointer appearance-none"
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-[#161821] text-white py-1">
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8B95A5] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Campo para Descrever quando selecionado 'Outro' */}
              {businessType === 'Outro (descrever)' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold text-[#11C76F] mb-1.5 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Descreva seu tipo de negócio</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customBusinessType}
                    onChange={(e) => setCustomBusinessType(e.target.value)}
                    placeholder="Ex: Oficina Mecânica, Gráfica Rápida, Marcenaria..."
                    className="w-full px-4 py-3 bg-[#12141A] border border-[#11C76F]/50 focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
                  />
                </div>
              )}

              {/* Botão Criar Conta */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0D0E12]" />
                ) : (
                  <>
                    <span>Criar Conta e Entrar</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODO 2: ENTRAR (LOGIN POR USUÁRIO E SENHA)               */}
          {/* ======================================================== */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="admin ou seu nome de usuário"
                    className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-mono text-white placeholder-[#5F6876] outline-none"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
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

              <div className="p-3 bg-[#1E212D] rounded-xl border border-[#262936] flex items-center justify-between text-xs">
                <span className="text-[#8B95A5]">Acesso demonstrativo:</span>
                <span className="font-mono text-[#11C76F] font-bold bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-lg">
                  admin : 123456
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0D0E12]" />
                ) : (
                  <>
                    <span>Entrar no EnablePay</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Rodapé de Segurança */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#8B95A5] mt-6">
          <ShieldCheck className="w-4 h-4 text-[#11C76F]" />
          <span>EnablePay • Controle de promissórias e amortizações</span>
        </div>
      </div>
    </div>
  );
};
