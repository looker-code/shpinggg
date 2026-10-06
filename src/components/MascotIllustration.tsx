import React from 'react';

interface MascotProps {
  className?: string;
  holdingCouponText?: string;
}

export const MascotIllustration: React.FC<MascotProps> = ({
  className = "w-44 h-56",
  holdingCouponText = "R$100"
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Tuxedo Dog Mascot SVG */}
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="earShade" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f3c292" />
            <stop offset="100%" stopColor="#c57c46" />
          </radialGradient>
          <radialGradient id="faceShade" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#f8d6af" />
            <stop offset="70%" stopColor="#eeb984" />
            <stop offset="100%" stopColor="#d59458" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ears */}
        {/* Left Ear */}
        <path
          d="M 50 70 C 30 35 45 10 75 35 C 80 45 75 65 60 70 Z"
          fill="#d59458"
          stroke="#5a3116"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 53 62 C 40 38 52 22 70 40 C 72 47 67 60 56 63 Z"
          fill="#c57c46"
          opacity="0.6"
        />

        {/* Right Ear */}
        <path
          d="M 150 70 C 170 35 155 10 125 35 C 120 45 125 65 140 70 Z"
          fill="#d59458"
          stroke="#5a3116"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 147 62 C 160 38 148 22 130 40 C 128 47 133 60 144 63 Z"
          fill="#c57c46"
          opacity="0.6"
        />

        {/* Tail wagging behind */}
        <path
          d="M 145 195 Q 175 190 170 170 Q 155 175 140 185"
          fill="#d59458"
          stroke="#5a3116"
          strokeWidth="3"
        />

        {/* Legs / Trousers */}
        <path
          d="M 82 205 L 82 225 Q 82 232 75 232 L 68 232 Q 62 232 64 225 L 70 205 Z"
          fill="#1e1e24"
          stroke="#000"
          strokeWidth="2.5"
        />
        <path
          d="M 118 205 L 118 225 Q 118 232 125 232 L 132 232 Q 138 232 136 225 L 130 205 Z"
          fill="#1e1e24"
          stroke="#000"
          strokeWidth="2.5"
        />
        {/* Shiny Shoes */}
        <ellipse cx="70" cy="231" rx="10" ry="5" fill="#0d0d11" stroke="#000" strokeWidth="2" />
        <ellipse cx="130" cy="231" rx="10" ry="5" fill="#0d0d11" stroke="#000" strokeWidth="2" />

        {/* Tuxedo Body / Jacket */}
        <path
          d="M 68 135 Q 100 130 132 135 L 142 208 Q 100 216 58 208 Z"
          fill="#23242b"
          stroke="#111"
          strokeWidth="3"
        />

        {/* White Dress Shirt V */}
        <polygon
          points="85,133 115,133 100,175"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* Tuxedo Lapels */}
        {/* Left Lapel */}
        <path
          d="M 75 134 L 98 178 L 84 180 L 68 135 Z"
          fill="#15161b"
          stroke="#050508"
          strokeWidth="2"
        />
        {/* Right Lapel */}
        <path
          d="M 125 134 L 102 178 L 116 180 L 132 135 Z"
          fill="#15161b"
          stroke="#050508"
          strokeWidth="2"
        />

        {/* Bow Tie (Red / Black stylish) */}
        <path
          d="M 90 140 L 110 148 L 110 140 L 90 148 Z"
          fill="#1a1a1a"
          stroke="#000000"
          strokeWidth="2"
        />
        <circle cx="100" cy="144" r="3.5" fill="#ee4d2d" />

        {/* Tuxedo buttons */}
        <circle cx="100" cy="188" r="2.5" fill="#d4af37" />
        <circle cx="100" cy="198" r="2.5" fill="#d4af37" />

        {/* Arms / Sleeves */}
        {/* Left Arm holding voucher */}
        <path
          d="M 70 140 Q 52 165 80 185"
          fill="none"
          stroke="#23242b"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Left Hand Cuff & Paw */}
        <circle cx="86" cy="180" r="7" fill="#f8d6af" stroke="#5a3116" strokeWidth="2.5" />

        {/* Right Arm holding voucher forward */}
        <path
          d="M 130 142 Q 148 165 125 185"
          fill="none"
          stroke="#23242b"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="118" cy="180" r="7" fill="#f8d6af" stroke="#5a3116" strokeWidth="2.5" />

        {/* Head */}
        <ellipse
          cx="100"
          cy="85"
          rx="48"
          ry="44"
          fill="url(#faceShade)"
          stroke="#5a3116"
          strokeWidth="3.5"
        />

        {/* Cheeks blush */}
        <ellipse cx="68" cy="98" rx="8" ry="5" fill="#f87171" opacity="0.45" />
        <ellipse cx="132" cy="98" rx="8" ry="5" fill="#f87171" opacity="0.45" />

        {/* Snout */}
        <ellipse
          cx="100"
          cy="97"
          rx="18"
          ry="14"
          fill="#fff5ea"
          stroke="#6d3b19"
          strokeWidth="2.5"
        />

        {/* Cute Black Nose */}
        <ellipse cx="100" cy="91" rx="6" ry="4.5" fill="#2d180b" />
        {/* Nose shine */}
        <ellipse cx="98.5" cy="89.5" rx="2" ry="1.2" fill="#ffffff" />

        {/* Mouth */}
        <path
          d="M 94 98 Q 100 104 100 97 Q 100 104 106 98"
          fill="none"
          stroke="#2d180b"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Tongue / Open smile */}
        <path
          d="M 97 101 Q 100 109 103 101 Z"
          fill="#ef4444"
        />

        {/* Eyes */}
        {/* Left Eye */}
        <ellipse cx="78" cy="78" rx="6.5" ry="9" fill="#251206" />
        <circle cx="76" cy="74" r="2.8" fill="#ffffff" />
        <circle cx="80" cy="82" r="1.2" fill="#ffffff" />

        {/* Right Eye */}
        <ellipse cx="122" cy="78" rx="6.5" ry="9" fill="#251206" />
        <circle cx="120" cy="74" r="2.8" fill="#ffffff" />
        <circle cx="124" cy="82" r="1.2" fill="#ffffff" />

        {/* Eyebrows */}
        <path
          d="M 72 65 Q 78 61 84 66"
          fill="none"
          stroke="#451e08"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 116 66 Q 122 61 128 65"
          fill="none"
          stroke="#451e08"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Forehead tuft / fur */}
        <path
          d="M 96 42 Q 100 35 104 42"
          fill="none"
          stroke="#5a3116"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating Voucher Held in Hands */}
      <div className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer drop-shadow-xl">
        <div className="bg-white border-2 border-orange-500 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
          {/* Shopee Bag Icon */}
          <div className="w-6 h-7 bg-[#ee4d2d] rounded-sm flex flex-col items-center justify-center p-0.5 relative shadow-sm">
            <div className="w-2.5 h-1.5 border-2 border-white rounded-t-full -mt-2 mb-0.5" />
            <span className="text-[10px] font-black text-white leading-none font-sans">S</span>
          </div>
          <span className="text-base font-black text-gray-900 tracking-tight font-sans whitespace-nowrap">
            {holdingCouponText}
          </span>
        </div>
      </div>
    </div>
  );
};
