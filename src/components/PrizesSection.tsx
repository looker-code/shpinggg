import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';

interface PrizesSectionProps {
  onSelectPrize?: (prizeName: string) => void;
}

export const PrizesSection: React.FC<PrizesSectionProps> = ({ onSelectPrize }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onSelectPrize) onSelectPrize(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const vouchers = [
    {
      id: 'V100',
      value: 'R$100',
      off: 'R$100 OFF',
      minSpend: 'Gasto mínimo R$199',
      code: 'FIGURINHA100',
    },
    {
      id: 'V50',
      value: 'R$50',
      off: 'R$50 OFF',
      minSpend: 'Gasto mínimo R$120',
      code: 'FIGURINHA50',
    },
    {
      id: 'V30',
      value: 'R$30',
      off: 'R$30 OFF',
      minSpend: 'Gasto mínimo R$80',
      code: 'FIGURINHA30',
    },
  ];

  const coins = [
    {
      id: 'C1500',
      amount: '1500 Moedas',
      type: 'bag',
    },
    {
      id: 'C500',
      amount: '500 Moedas',
      type: 'huge',
    },
    {
      id: 'C100',
      amount: '100 Moedas',
      type: 'medium',
    },
    {
      id: 'C50',
      amount: '50 Moedas',
      type: 'single',
    },
  ];

  return (
    <div className="w-full relative mt-6 mb-8">
      {/* Floating Header Pill "PRÊMIOS" */}
      <div className="flex justify-center -mb-5 relative z-10">
        <div className="bg-white px-9 py-2 rounded-full border-4 border-[#ba1524] shadow-md">
          <h2 className="text-[#ba1524] font-black text-xl md:text-2xl tracking-wide uppercase font-sans">
            PRÊMIOS
          </h2>
        </div>
      </div>

      {/* Main Red Card */}
      <div className="bg-[#b91524] rounded-3xl pt-9 pb-8 px-4 sm:px-6 shadow-2xl border-2 border-red-700/50">
        {/* Row 1: Vouchers */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-8 border-b border-red-800/60">
          {vouchers.map((v) => (
            <div
              key={v.id}
              onClick={() => copyCoupon(v.code)}
              className="flex flex-col items-center text-center cursor-pointer group active:scale-95 transition-transform"
            >
              {/* Voucher Graphic Card */}
              <div className="relative mb-2 w-full max-w-[110px] aspect-[1.4/1] bg-white rounded-lg p-1.5 shadow-md border-2 border-orange-400 flex items-center justify-center gap-1 group-hover:shadow-lg transition-shadow">
                {/* Shopee Bag */}
                <div className="w-6 h-7 bg-[#ee4d2d] rounded-sm flex flex-col items-center justify-center p-0.5 relative shrink-0">
                  <div className="w-2.5 h-1 border-2 border-white rounded-t-full -mt-1.5 mb-0.5" />
                  <span className="text-[9px] font-black text-white leading-none">S</span>
                </div>
                {/* Value Text */}
                <span className="text-xs sm:text-sm font-black text-gray-900 tracking-tight leading-none">
                  {v.value}
                </span>
              </div>

              {/* OFF Title */}
              <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-tight leading-tight">
                {v.off}
              </h3>

              {/* Min Spend */}
              <p className="text-white/80 text-[10px] sm:text-xs font-normal mt-0.5 leading-snug">
                {v.minSpend}
              </p>

              {/* Feedback */}
              {copiedCode === v.code && (
                <span className="text-[10px] font-bold text-yellow-300 mt-1 flex items-center gap-0.5 animate-pulse">
                  <Check className="w-3 h-3" /> Resgatado!
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Row 2: Coin Rewards */}
        <div className="grid grid-cols-4 gap-2 pt-6">
          {coins.map((coin) => (
            <div
              key={coin.id}
              onClick={() => onSelectPrize && onSelectPrize(coin.amount)}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-transform"
            >
              {/* Coin Graphic Illustration */}
              <div className="h-14 flex items-center justify-center mb-1">
                {coin.type === 'bag' ? (
                  // Red Money Bag with Gold Coins
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 60 60" className="w-12 h-12 drop-shadow-md">
                      {/* Pouch */}
                      <path
                        d="M 18 20 C 10 32 8 50 30 52 C 52 50 50 32 42 20 C 38 16 22 16 18 20 Z"
                        fill="#d9242d"
                        stroke="#800a0f"
                        strokeWidth="2"
                      />
                      {/* Pouch Tie */}
                      <ellipse cx="30" cy="20" rx="10" ry="3.5" fill="#eab308" />
                      {/* Coin Symbol on Bag */}
                      <circle cx="30" cy="36" r="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                      <text
                        x="30"
                        y="41"
                        textAnchor="middle"
                        fill="#78350f"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        $
                      </text>
                      {/* Coins spilling */}
                      <circle cx="42" cy="22" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                      <circle cx="20" cy="22" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    </svg>
                  </div>
                ) : coin.type === 'huge' ? (
                  // Huge Pile of Gold Coins
                  <div className="relative">
                    <svg viewBox="0 0 70 45" className="w-14 h-10 drop-shadow-md">
                      <ellipse cx="35" cy="35" rx="30" ry="9" fill="#ca8a04" />
                      <ellipse cx="25" cy="30" rx="16" ry="6" fill="#facc15" stroke="#eab308" strokeWidth="1.2" />
                      <ellipse cx="45" cy="30" rx="16" ry="6" fill="#fde047" stroke="#eab308" strokeWidth="1.2" />
                      <ellipse cx="35" cy="24" rx="18" ry="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                      <ellipse cx="35" cy="18" rx="14" ry="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
                      <ellipse cx="35" cy="12" rx="10" ry="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                      <circle cx="35" cy="12" r="3" fill="#ca8a04" opacity="0.3" />
                    </svg>
                  </div>
                ) : coin.type === 'medium' ? (
                  // Medium Pile of Gold Coins
                  <div className="relative">
                    <svg viewBox="0 0 60 40" className="w-12 h-9 drop-shadow-md">
                      <ellipse cx="30" cy="30" rx="24" ry="7" fill="#ca8a04" />
                      <ellipse cx="24" cy="26" rx="14" ry="5" fill="#facc15" stroke="#eab308" strokeWidth="1.2" />
                      <ellipse cx="36" cy="26" rx="14" ry="5" fill="#fde047" stroke="#eab308" strokeWidth="1.2" />
                      <ellipse cx="30" cy="20" rx="14" ry="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                      <ellipse cx="30" cy="14" rx="10" ry="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
                    </svg>
                  </div>
                ) : (
                  // Single stacked gold coin
                  <div className="relative">
                    <svg viewBox="0 0 50 40" className="w-10 h-8 drop-shadow-md">
                      <ellipse cx="25" cy="26" rx="15" ry="6" fill="#ca8a04" />
                      <ellipse cx="25" cy="22" rx="15" ry="6" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                      <ellipse cx="25" cy="18" rx="15" ry="6" fill="#facc15" stroke="#eab308" strokeWidth="1" />
                      <ellipse cx="25" cy="14" rx="15" ry="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                      <text
                        x="25"
                        y="17"
                        textAnchor="middle"
                        fill="#854d0e"
                        fontSize="8"
                        fontWeight="black"
                        fontFamily="sans-serif"
                      >
                        $
                      </text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Amount Label */}
              <span className="text-white text-[11px] sm:text-xs font-bold leading-tight group-hover:text-yellow-200 transition-colors">
                {coin.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
