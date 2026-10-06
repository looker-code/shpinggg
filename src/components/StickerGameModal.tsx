import React from 'react';
import { Sparkles } from 'lucide-react';

interface StickerGameModalProps {
  isOpen: boolean;
  onRedeemSet: () => void;
}

export const StickerGameModal: React.FC<StickerGameModalProps> = ({
  isOpen,
  onRedeemSet,
}) => {
  if (!isOpen) return null;

  return (
    // Fixed backdrop that DOES NOT close when clicked on sides
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 select-none"
      onClick={(e) => e.stopPropagation()} // Prevent any side clicks from closing
    >
      {/* Floating Card Container */}
      <div
        className="w-full max-w-[420px] bg-[#d71920] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border-4 border-red-500 p-4 sm:p-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Area (Sem botão voltar, sem relógio, sem sino, sem ?) */}
        <div className="text-center pt-1 pb-3 shrink-0">
          <h1
            className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-sans drop-shadow-md"
            style={{
              textShadow: `
                -2px -2px 0 #0046b8,
                2px -2px 0 #0046b8,
                -2px 2px 0 #0046b8,
                2px 2px 0 #0046b8,
                0 4px 6px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            SHOPEE FIGURINHAS
          </h1>
          <p className="text-white text-xs sm:text-[13px] font-bold mt-1 tracking-tight">
            Colete todos os itens até 08/10/2026
          </p>
        </div>

        {/* Central Dark Red Panel */}
        <div className="bg-[#a60e18] rounded-3xl p-3 sm:p-3.5 shadow-xl border border-red-700/60 flex flex-col gap-3">
          
          {/* Stickers Grid */}
          <div className="grid grid-cols-12 gap-2">
            
            {/* 1. CASAS BAHIA (Card alto à esquerda - spans 5 cols & altura completa) */}
            <div className="col-span-5 bg-white rounded-2xl p-2.5 flex flex-col justify-between shadow-lg relative min-h-[165px] border-2 border-white">
              {/* Badge "ESPECIAL" top left */}
              <div className="bg-[#ee4d2d] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider self-start shadow-xs">
                ESPECIAL
              </div>

              {/* Círculo indicador concluído top right */}
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              {/* Logo Casas Bahia */}
              <div className="my-auto py-2 text-center flex flex-col items-center justify-center">
                <span className="font-black text-base sm:text-lg text-[#002f6c] tracking-tight leading-none block">
                  CASAS
                </span>
                <span className="font-black text-base sm:text-lg text-[#e60014] tracking-tight leading-none block">
                  BAHIA
                </span>
              </div>

              <div className="text-[9px] text-gray-400 font-bold text-center">
                Coleção 2026
              </div>
            </div>

            {/* Grid 2x2 à direita (spans 7 cols) */}
            <div className="col-span-7 grid grid-cols-2 gap-2">
              
              {/* 2. NIVEA */}
              <div className="bg-[#002b66] text-white rounded-2xl p-2 flex flex-col justify-between shadow-lg relative aspect-[1.1/1] border-2 border-blue-900">
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="my-auto flex items-center justify-center">
                  <span className="font-black text-xs sm:text-sm tracking-wider uppercase">
                    NIVEA
                  </span>
                </div>
              </div>

              {/* 3. BRITANIA */}
              <div className="bg-white text-gray-900 rounded-2xl p-2 flex flex-col justify-between shadow-lg relative aspect-[1.1/1] border-2 border-white">
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="my-auto flex items-center justify-center">
                  <span className="font-black italic text-[11px] sm:text-xs tracking-tight uppercase text-slate-900">
                    BRITÂNIA
                  </span>
                </div>
              </div>

              {/* 4. GOCASE */}
              <div className="bg-[#0a4595] text-white rounded-2xl p-2 flex flex-col justify-between shadow-lg relative aspect-[1.1/1] border-2 border-blue-800">
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="my-auto flex items-center justify-center">
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight lowercase">
                    gocase
                  </span>
                </div>
              </div>

              {/* 5. MADEIRA MADEIRA */}
              <div className="bg-[#f25c05] text-white rounded-2xl p-1.5 flex flex-col justify-between shadow-lg relative aspect-[1.1/1] border-2 border-orange-400">
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="my-auto flex flex-col items-center justify-center text-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white mb-0.5">
                    <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5l5 4.5v6H7v-6l5-4.5z" />
                  </svg>
                  <span className="font-black text-[8px] sm:text-[9px] leading-tight tracking-tighter">
                    madeira<br />madeira
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* White Card: PRÊMIOS DISPONÍVEIS */}
          <div className="bg-white rounded-2xl p-3 shadow-md text-center">
            <h3 className="text-[#a60e18] font-black text-xs uppercase tracking-wide mb-2">
              PRÊMIOS DISPONÍVEIS
            </h3>

            <div className="grid grid-cols-4 gap-1 items-end">
              {/* 1500 Moedas */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9">
                    <path d="M 12 14 C 6 22 5 34 20 35 C 35 34 34 22 28 14 C 25 11 15 11 12 14 Z" fill="#d9242d" />
                    <ellipse cx="20" cy="14" rx="7" ry="2.5" fill="#eab308" />
                    <circle cx="20" cy="24" r="5" fill="#facc15" />
                    <text x="20" y="27" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">$</text>
                  </svg>
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-red-950 font-black text-[7px] sm:text-[8px] px-1 rounded-sm shadow-xs">
                    1500
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-700 truncate w-full">
                  1500 Moedas S...
                </span>
              </div>

              {/* 500 Moedas */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <svg viewBox="0 0 40 30" className="w-8 h-6 sm:w-9 sm:h-7">
                    <ellipse cx="20" cy="22" rx="16" ry="6" fill="#ca8a04" />
                    <ellipse cx="20" cy="16" rx="14" ry="5" fill="#facc15" />
                    <ellipse cx="20" cy="10" rx="10" ry="4" fill="#fef08a" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-red-950 font-black text-[7px] sm:text-[8px] px-1 rounded-sm shadow-xs">
                    500
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-700 truncate w-full">
                  500 Moedas Sh...
                </span>
              </div>

              {/* 100 Moedas */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <svg viewBox="0 0 36 28" className="w-7 h-6 sm:w-8 sm:h-7">
                    <ellipse cx="18" cy="20" rx="14" ry="5" fill="#ca8a04" />
                    <ellipse cx="18" cy="14" rx="12" ry="4" fill="#facc15" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-red-950 font-black text-[7px] sm:text-[8px] px-1 rounded-sm shadow-xs">
                    100
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-700 truncate w-full">
                  100 Moedas Sh...
                </span>
              </div>

              {/* 50 Moedas */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <svg viewBox="0 0 30 26" className="w-7 h-6 sm:w-7 sm:h-7">
                    <ellipse cx="15" cy="18" rx="11" ry="4" fill="#ca8a04" />
                    <ellipse cx="15" cy="13" rx="11" ry="4" fill="#facc15" />
                    <text x="15" y="15" textAnchor="middle" fill="#854d0e" fontSize="6" fontWeight="bold">$</text>
                  </svg>
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-red-950 font-black text-[7px] sm:text-[8px] px-1 rounded-sm shadow-xs">
                    50
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-700 truncate w-full">
                  50 Moedas
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTÃO EM DESTAQUE: "RESGATAR CONJUNTO AGORA!" */}
        <div className="pt-4 pb-1 text-center shrink-0">
          <button
            onClick={onRedeemSet}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base sm:text-lg py-4 px-6 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>RESGATAR CONJUNTO AGORA!</span>
          </button>
        </div>

      </div>
    </div>
  );
};
