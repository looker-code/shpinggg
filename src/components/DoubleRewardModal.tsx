import React from 'react';
import { X, Share2, Gift, Copy } from 'lucide-react';

interface DoubleRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  onSkip: () => void;
}

export const DoubleRewardModal: React.FC<DoubleRewardModalProps> = ({
  isOpen,
  onClose,
  onShare,
  onSkip,
}) => {
  if (!isOpen) return null;

  const handleShareClick = async () => {
    const text = 'ADQUIRA AGORA O CONJUNTO DE FIGURINHAS POR TEMPO LIMITADO!';
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch (e) {
      console.error(e);
    }
    
    onShare();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-4 border-[#ffd700] relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-white flex flex-col items-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-amber-300">
            <Gift className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="font-black text-2xl text-center leading-tight uppercase tracking-wide drop-shadow-md">
            Deseja Receber<br />Em Dobro?
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5 bg-orange-50">
          <p className="text-gray-700 font-bold text-sm">
            Compartilhe seu link com amigos agora mesmo e garanta <span className="text-orange-600 font-black text-base">O DOBRO</span> de prêmios no seu resgate!
          </p>

          <button
            onClick={handleShareClick}
            className="w-full bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>COPIAR O LINK</span>
          </button>

          <button
            onClick={onSkip}
            className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors underline decoration-gray-300"
          >
            Não quero receber em dobro, continuar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
