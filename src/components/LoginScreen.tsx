import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
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
  Mail,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { 
  sendMagicLink, 
  loginWithSimulatedMagicLink,
  loginWithPassword, 
  registerWithPassword,
  isValidEmail,
  UserProfile 
} from '../utils/auth';

interface LoginScreenProps {
  onLogin: (user?: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Modos: 'login' | 'cadastro'
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('login');
  // Métodos: 'magic_link' | 'senha'
  const [authMethod, setAuthMethod] = useState<'magic_link' | 'senha'>('magic_link');

  // Campos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Estado do Link Mágico
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Contador de reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // --- Enviar Link Mágico para o E-mail ---
  const handleSendMagicLink = async (e: React.FormEvent) => {
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
      const res = await sendMagicLink(cleanEmail, authMode === 'cadastro' ? name : undefined);
      setIsLoading(false);

      if (res.success) {
        setMagicLinkSent(true);
        setIsRealEmailSent(res.isRealEmail);
        setCountdown(60);
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao enviar Link Mágico. Tente novamente.');
    }
  };

  // --- Login ou Cadastro por Senha ---
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
            Gestão financeira de amortizações, promissórias e títulos a pagar
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
                setMagicLinkSent(false);
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
                setMagicLinkSent(false);
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

          {/* Abas: Magic Link vs Senha */}
          <div className="flex items-center justify-center gap-6 text-xs font-semibold border-b border-[#262936] pb-3">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('magic_link');
                setMagicLinkSent(false);
                setErrorMessage('');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                authMethod === 'magic_link'
                  ? 'border-[#11C76F] text-[#11C76F] font-bold'
                  : 'border-transparent text-[#8B95A5] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Magic Link</span>
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

          {successMessage && !magicLinkSent && (
            <div className="p-3 bg-[#11C76F]/10 border border-[#11C76F]/30 rounded-xl text-[#11C76F] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MÉTODO 1: MAGIC LINK (LINK MÁGICO POR E-MAIL)           */}
          {/* ======================================================== */}
          {authMethod === 'magic_link' && (
            <>
              {!magicLinkSent ? (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
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
                      {authMode === 'cadastro' 
                        ? 'Enviaremos um link mágico para você confirmar o cadastro e entrar com 1 clique.'
                        : 'Enviaremos um link de acesso direto. Sem senhas para memorizar.'}
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
                        <Sparkles className="w-4 h-4 fill-[#0D0E12]" />
                        <span>
                          {authMode === 'cadastro' 
                            ? 'Cadastrar com Magic Link' 
                            : 'Enviar Magic Link'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 animate-in fade-in text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-[#11C76F]/15 border-2 border-[#11C76F] flex items-center justify-center mx-auto text-[#11C76F]">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Magic Link Enviado!</h3>
                    <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">
                      Enviamos um link de acesso seguro para:
                    </p>
                    <div className="mt-2 py-1.5 px-3 bg-[#12141A] rounded-xl border border-[#262936] inline-block text-xs font-bold text-[#11C76F]">
                      {email}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#12141A] rounded-2xl border border-[#262936] text-xs text-[#8B95A5] text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Mail className="w-4 h-4 text-[#11C76F]" />
                      <span>Como entrar:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Abra a caixa de entrada do seu e-mail (ou pasta de Spam) e clique no botão 
                      <strong className="text-white"> "Confirm your email"</strong> ou 
                      <strong className="text-white"> "Log In"</strong>. Você será conectado automaticamente ao EnablePay!
                    </p>
                  </div>

                  {/* Fallback rápido para testes caso não tenha configurado SMTP real ainda */}
                  {!isRealEmailSent && (
                    <button
                      type="button"
                      onClick={() => {
                        const profile = loginWithSimulatedMagicLink(email, name);
                        onLogin(profile);
                      }}
                      className="w-full py-2.5 bg-[#11C76F]/15 hover:bg-[#11C76F]/25 text-[#11C76F] border border-[#11C76F]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Simular clique no link (Entrar Agora)</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMagicLinkSent(false);
                      }}
                      className="text-[#8B95A5] hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Trocar e-mail
                    </button>

                    <button
                      type="button"
                      disabled={countdown > 0 || isLoading}
                      onClick={handleSendMagicLink}
                      className="text-[#11C76F] disabled:text-[#8B95A5] font-bold hover:underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar Link'}
                    </button>
                  </div>
                </div>
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
                    <span>{authMode === 'cadastro' ? 'Finalizar Cadastro' : 'Entrar com Senha'}</span>
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
          <span>EnablePay • Autenticação segura via Magic Link e Senha</span>
        </div>
      </div>
    </div>
  );
};
