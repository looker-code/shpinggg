import React from 'react';
import { Sparkles, Share2, ClipboardList, Gift, CheckSquare } from 'lucide-react';

interface HowToPlaySectionProps {
  onDrawClick: () => void;
  onShareClick: () => void;
  onTasksClick: () => void;
  onClaimClick: () => void;
}

export const HowToPlaySection: React.FC<HowToPlaySectionProps> = ({
  onDrawClick,
  onShareClick,
  onTasksClick,
  onClaimClick,
}) => {
  return (
    <div className="w-full relative mt-4 mb-8">
      {/* "COMO JOGAR" Floating Header Pill */}
      <div className="flex justify-center -mb-5 relative z-10">
        <div className="bg-white px-7 py-2 rounded-full border-4 border-[#ba1524] shadow-md">
          <h2 className="text-[#ba1524] font-black text-xl md:text-2xl tracking-wide uppercase font-sans">
            COMO JOGAR
          </h2>
        </div>
      </div>

      {/* Main Red Section Card */}
      <div className="bg-[#b91524] rounded-3xl pt-8 pb-7 px-4 sm:px-6 shadow-2xl border-2 border-red-700/50">
        {/* Top 3 Steps: 1, 2, 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-6 border-b border-red-800/60">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step Number Circle */}
            <div className="w-9 h-9 rounded-full bg-white text-[#b91524] font-black text-lg flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
              1
            </div>

            {/* Visual Icon / Button */}
            <div className="h-16 flex items-center justify-center">
              <button
                onClick={onDrawClick}
                className="bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-blue-400/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                <span>Sortear item</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-white text-xs md:text-sm font-medium leading-snug max-w-[210px] mt-1">
              Você tem 2 chances diárias para sortear figurinhas
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step Number Circle */}
            <div className="w-9 h-9 rounded-full bg-white text-[#b91524] font-black text-lg flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
              2
            </div>

            {/* Visual Icon / Button */}
            <div className="h-16 flex items-center justify-center">
              <button
                onClick={onShareClick}
                className="w-12 h-12 bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg border border-blue-400/40 transition-transform cursor-pointer"
                aria-label="Compartilhar"
              >
                <Share2 className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Description */}
            <p className="text-white text-xs md:text-sm font-medium leading-snug max-w-[210px] mt-1">
              Compartilhe e peça figurinhas aos seus amigos
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step Number Circle */}
            <div className="w-9 h-9 rounded-full bg-white text-[#b91524] font-black text-lg flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
              3
            </div>

            {/* Visual Icon / Button */}
            <div className="h-16 flex items-center justify-center">
              <button
                onClick={onTasksClick}
                className="w-12 h-13 bg-white text-red-600 rounded-lg shadow-lg border-2 border-slate-100 flex flex-col items-center justify-center p-1 relative hover:scale-105 transition-transform cursor-pointer"
                aria-label="Ver tarefas diárias"
              >
                <div className="w-4 h-1.5 bg-gray-400 rounded-t-sm -mt-1 mb-0.5" />
                <ClipboardList className="w-7 h-7 text-[#b91524]" />
              </button>
            </div>

            {/* Description */}
            <p className="text-white text-xs md:text-sm font-medium leading-snug max-w-[210px] mt-1">
              Cumpra as tarefas para conseguir chances extras de figurinhas
            </p>
          </div>
        </div>

        {/* Bottom 2 Steps: 4 and 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-9 h-9 rounded-full bg-white text-[#b91524] font-black text-lg flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
              4
            </div>

            {/* Visual: Brand sticker cards (MadeiraMadeira + Gocase) */}
            <div className="h-16 flex items-center justify-center relative">
              {/* MadeiraMadeira sticker */}
              <div className="w-13 h-13 bg-[#f25c05] rounded-xl shadow-md border-2 border-white flex flex-col items-center justify-center p-1 transform -rotate-6 z-0 hover:rotate-0 transition-transform">
                <span className="text-[7px] font-black text-white leading-tight uppercase text-center">
                  madeira<br />madeira
                </span>
              </div>

              {/* Gocase sticker */}
              <div className="w-13 h-13 bg-[#0a4595] rounded-xl shadow-md border-2 border-white flex items-center justify-center p-1 transform rotate-6 -ml-3 z-10 hover:rotate-0 transition-transform">
                <span className="text-[9px] font-bold text-white lowercase tracking-tight">
                  gocase
                </span>
              </div>
            </div>

            <p className="text-white text-xs md:text-sm font-medium leading-snug max-w-[230px] mt-1">
              Faça a sua coleção com pelo menos uma figurinha de cada
            </p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-9 h-9 rounded-full bg-white text-[#b91524] font-black text-lg flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
              5
            </div>

            {/* Visual: Blue button */}
            <div className="h-16 flex items-center justify-center">
              <button
                onClick={onClaimClick}
                className="bg-[#0052d4] hover:bg-[#0041a8] active:scale-95 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-blue-400/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Sorteie 1 prêmio(s)</span>
              </button>
            </div>

            <p className="text-white text-xs md:text-sm font-medium leading-snug max-w-[230px] mt-1">
              Resgate o seu prêmio em Moedas Shopee ou Cupons de descontos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
