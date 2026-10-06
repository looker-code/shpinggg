import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#fbfbfb] border-t border-gray-200 text-gray-600 text-xs mt-12 select-none">
      {/* Pagamento e Bandeiras apenas */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <h3 className="font-bold text-gray-800 text-xs md:text-sm uppercase mb-4 tracking-wider">
          PAGAMENTO
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-xl">
          {/* Visa */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-black italic text-blue-800 text-sm tracking-tighter">VISA</span>
          </div>

          {/* Mastercard */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 bg-red-600 rounded-full" />
              <div className="w-5 h-5 bg-amber-500 rounded-full opacity-90" />
            </div>
          </div>

          {/* Elo */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-black text-black text-xs">elo</span>
          </div>

          {/* American Express */}
          <div className="bg-blue-600 border border-blue-700 hover:border-blue-800 rounded-md px-2.5 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-extrabold text-[9px] tracking-tighter text-white bg-blue-800 px-1 py-0.5 rounded-xs">
              AMEX
            </span>
          </div>

          {/* Boleto Bancário */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-bold text-gray-800 text-[10px] uppercase tracking-tight">
              Boleto
            </span>
          </div>

          {/* Pix */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
              <span className="text-sm">❖</span>pix
            </div>
          </div>

          {/* Hipercard */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-black italic text-red-600 text-[10px]">Hipercard</span>
          </div>

          {/* Mais! */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 flex items-center justify-center shadow-xs h-9 min-w-[56px] transition-transform hover:scale-105">
            <span className="font-bold text-orange-600 text-[10px]">Mais!</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
