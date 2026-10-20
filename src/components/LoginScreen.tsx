import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  KeyRound, 
  ArrowLeft,
  Inbox
} from 'lucide-react';
import { 
  sendEmailOtp, 
  verifyEmailOtp, 
  loginWithPassword, 
  registerWithPassword,
  isValidEmail,
  UserProfile 
} from '../utils/auth';

interface LoginScreenProps {
  onLogin: (user?: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Modos principais: 'login' | 'cadastro'
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('login');
  // Método de autenticação: 'email_otp' | 'senha'
  const [authMethod, setAuthMethod] = useState<'email_otp' | 'senha'>('email_otp');

  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Estados do fluxo de E-mail OTP
  const [emailStep, setEmailStep] = useState<'enter_email' | 'enter_code'>('enter_email');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [simulatedEmailToast, setSimulatedEmailToast] = useState<{ email: string; code: string } | null>(null);

  // Estados de feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Contador para reenvio de código por e-mail
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // --- Enviar Código OTP para o E-mail ---
  const handleRequestEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'cadastro' && !name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Digite um endereço de e-mail válido (ex: seu@email.com).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendEmailOtp(cleanEmail, authMode === 'cadastro' ? name : undefined);
      setIsLoading(false);

      if (res.success) {
        setEmailStep('enter_code');
        setCountdown(60);
        setSuccessMessage(res.message);

        // Se for gerado em modo teste/simulação direta, exibe a notificação visual do e-mail
        if (res.simulatedCode) {
          setSimulatedEmailToast({ email: cleanEmail, code: res.simulatedCode });
          setOtpCode(res.simulatedCode);
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao solicitar código de verificação por e-mail.');
    }
  };

  // --- Validar Código OTP recebido por E-mail ---
  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode.trim().length < 6) {
      setErrorMessage('Digite o código de 6 dígitos enviado para seu e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyEmailOtp(email, otpCode, name);
      setIsLoading(false);

      if (res.success && res.user) {
        setSimulatedEmailToast(null);
        onLogin(res.user);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao validar código OTP por e-mail.');
    }
  };

  // --- Login ou Cadastro por Senha Tradicional ---
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (authMode === 'cadastro') {
        const res = await registerWithPassword(name, identifier, password);
        setIsLoading(false);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await loginWithPassword(identifier, password);
        setIsLoading(false);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro de autenticação. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col items-center justify-center p-4 relative font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#11C76F] selection:text-[#0D0E12]">
      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-[#11C76F]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Pop-up Notificação de E-mail (quando em simulação ou teste rápido) */}
      {simulatedEmailToast && (
        <div className="fixed top-5 z-50 animate-in slide-in-from-top-4 duration-300 max-w-sm w-full px-4">
          <div className="bg-[#1C202C] border-2 border-[#11C76F] p-4 rounded-2xl shadow-[0_10px_40px_rgba(17,199,111,0.3)] text-xs space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8B95A5]">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Inbox className="w-4 h-4 text-[#11C76F]" />
                Novo E-mail: EnablePay • Agora
              </span>
              <button 
                onClick={() => setSimulatedEmailToast(null)}
                className="text-[#8B95A5] hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-white">
              Seu código de acesso OTP é:{' '}
              <strong className="text-[#11C76F] font-mono text-sm tracking-wider bg-[#11C76F]/10 px-2 py-0.5 rounded border border-[#11C76F]/20">
                {simulatedEmailToast.code}
              </strong>
            </p>
            <span className="text-[10px] text-[#8B95A5] block">
              Enviado para: {simulatedEmailToast.email} • Válido por 10 min
            </span>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm relative z-10">
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
          {/* Seletor: Entrar vs Criar Conta */}
          <div className="grid grid-cols-2 gap-1 bg-[#12141A] p-1 rounded-xl border border-[#262936]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setEmailStep('enter_email');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('cadastro');
                setEmailStep('enter_email');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'cadastro'
                  ? 'bg-[#11C76F] text-[#0D0E12] font-extrabold shadow-sm'
                  : 'text-[#8B95A5] hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Abas de Método: E-mail (Código OTP) vs Senha */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold border-b border-[#262936] pb-3">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email_otp');
                setEmailStep('enter_email');
                setErrorMessage('');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                authMethod === 'email_otp'
                  ? 'border-[#11C76F] text-[#11C76F] font-bold'
                  : 'border-transparent text-[#8B95A5] hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Código por E-mail (OTP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('senha');
                setErrorMessage('');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                authMethod === 'senha'
                  ? 'border-[#11C76F] text-[#11C76F] font-bold'
                  : 'border-transparent text-[#8B95A5] hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Senha</span>
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="p-3 bg-[#241318] border border-[#FF3B30]/30 rounded-xl text-[#FF453A] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#11C76F]/10 border border-[#11C76F]/30 rounded-xl text-[#11C76F] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MÉTODO 1: AUTENTICAÇÃO POR CÓDIGO OTP VIA E-MAIL         */}
          {/* ======================================================== */}
          {authMethod === 'email_otp' && (
            <>
              {emailStep === 'enter_email' ? (
                <form onSubmit={handleRequestEmailCode} className="space-y-4">
                  {authMode === 'cadastro' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                        Seu Nome Completo
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Carlos Eduardo"
                          className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                      Seu E-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage('');
                        }}
                        placeholder="seu@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-semibold text-white placeholder-[#5F6876] outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-[#8B95A5] block mt-1.5">
                      Enviaremos um código OTP de 6 dígitos para o seu e-mail.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0D0E12]" />
                    ) : (
                      <>
                        <span>{authMode === 'cadastro' ? 'Cadastrar com Código OTP' : 'Enviar Código por E-mail'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailCode} className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B95A5] truncate max-w-[210px]">
                      Enviado para: <strong className="text-white">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmailStep('enter_email')}
                      className="text-[#11C76F] hover:underline flex items-center gap-1 cursor-pointer font-bold shrink-0 ml-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Trocar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                      Código de 6 dígitos recebido no e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-lg font-black tracking-widest text-[#11C76F] placeholder-[#5F6876] outline-none text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#8B95A5]">Não recebeu o e-mail?</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || isLoading}
                      onClick={handleRequestEmailCode}
                      className="text-[#11C76F] disabled:text-[#8B95A5] font-bold hover:underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar Código'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0D0E12]" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirmar e Entrar</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* MÉTODO 2: SENHA TRADICIONAL                               */}
          {/* ======================================================== */}
          {authMethod === 'senha' && (
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {authMode === 'cadastro' && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="seu@email.com ou admin"
                    className="w-full pl-10 pr-4 py-3 bg-[#12141A] border border-[#262936] focus:border-[#11C76F] rounded-xl text-sm font-medium text-white placeholder-[#5F6876] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A5] mb-1.5">
                  {authMode === 'cadastro' ? 'Criar uma Senha' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {authMode === 'login' && (
                <div className="p-3 bg-[#1E212D] rounded-xl border border-[#262936] flex items-center justify-between text-xs">
                  <span className="text-[#8B95A5]">Acesso demonstrativo:</span>
                  <span className="font-mono text-[#11C76F] font-bold bg-[#11C76F]/10 border border-[#11C76F]/20 px-2 py-0.5 rounded-lg">
                    admin : 123456
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#11C76F] hover:bg-[#0EAD60] active:scale-[0.99] text-[#0D0E12] font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(17,199,111,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0D0E12]" />
                ) : (
                  <>
                    <span>{authMode === 'cadastro' ? 'Finalizar Cadastro' : 'Entrar no Sistema'}</span>
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
          <span>EnablePay • Autenticação segura por E-mail OTP</span>
        </div>
      </div>
    </div>
  );
};
