import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShared?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onShared }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://shopee.com.br/m/figurinhas';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    if (onShared) onShared();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSocialShare = (platform: string) => {
    if (onShared) onShared();
    const text = encodeURIComponent('Vem jogar o Shopee Figurinhas comigo e resgatar até R$100 OFF e moedas! ' + shareUrl);
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-[#0052d4]">
        {/* Header */}
        <div className="bg-[#0052d4] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-black text-lg">Compartilhar com Amigos</h3>
              <p className="text-[11px] text-white/80">Peça figurinhas que faltam e troque com amigos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0052d4] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <Share2 className="w-8 h-8" />
          </div>

          <h4 className="font-extrabold text-gray-800 text-base mb-1">
            Envie seu link exclusivo de troca
          </h4>
          <p className="text-xs text-gray-500 mb-6">
            Quando um amigo abrir seu link, ambos ganham 1 chance extra para sortear figurinhas!
          </p>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleSocialShare('whatsapp')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Outras Redes
            </button>
          </div>

          {/* Copy link input */}
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-gray-600 px-2 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
