import React from 'react';

export default function Logo({ className = "h-14 sm:h-16", isDark = false }) {
  const mainColor = isDark ? "#ffffff" : "#18181b";
  const redColor = "#e51b24";

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="10 10 430 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <g transform="skewX(-10) translate(20, 0)">
          {/* L */}
          <text
            x="15"
            y="146"
            fill={mainColor}
            fontFamily="'Arial Black', 'Impact', 'Plus Jakarta Sans', sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="148"
          >
            L
          </text>

          {/* i - Red Dot */}
          <circle cx="152" cy="28" r="14.5" fill={redColor} />

          {/* i - Red Curved Body */}
          <path
            d="M 160 48 C 146 68 132 96 125 118 C 117 144 125 156 148 162 C 175 168 220 162 245 152 C 218 158 174 158 150 148 C 136 142 131 130 135 112 C 141 90 153 66 164 48 Z"
            fill={redColor}
          />

          {/* Center Red Sphere */}
          <circle cx="206" cy="108" r="28" fill={redColor} />

          {/* Black Wave/Swirl over the red sphere */}
          <path
            d="M 196 40 C 220 40 258 50 274 76 C 286 96 285 118 278 136 C 283 116 280 94 268 74 C 254 54 226 46 200 46 C 182 46 174 52 174 52 C 174 52 186 40 196 40 Z"
            fill={mainColor}
          />

          {/* G */}
          <text
            x="275"
            y="146"
            fill={mainColor}
            fontFamily="'Arial Black', 'Impact', 'Plus Jakarta Sans', sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="148"
          >
            G
          </text>
        </g>

        {/* Bottom Red Bar with IRMÃOS BARREIRO */}
        <g transform="translate(15, 160)">
          <rect
            x="0"
            y="0"
            width="420"
            height="28"
            rx="2"
            fill={redColor}
          />
          <text
            x="210"
            y="20"
            fill="#ffffff"
            textAnchor="middle"
            fontFamily="'Arial Black', 'Montserrat', 'Plus Jakarta Sans', sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="16.5"
            letterSpacing="6"
          >
            IRMÃOS BARREIRO
          </text>
        </g>
      </svg>
    </div>
  );
}
