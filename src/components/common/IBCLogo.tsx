import React from 'react';

interface IBCLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IBCLogo: React.FC<IBCLogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = 
    size === 'sm' ? 'w-8 h-8' : 
    size === 'lg' ? 'w-14 h-14' : 
    size === 'xl' ? 'w-20 h-20' : 
    'w-10 h-10';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Oval Crest */}
        <ellipse cx="100" cy="92" rx="84" ry="74" fill="#849b82" stroke="#4a5f48" strokeWidth="3" />
        <ellipse cx="100" cy="92" rx="77" ry="67" fill="none" stroke="#637c61" strokeWidth="1.5" strokeDasharray="4 2" />
        
        {/* Church Silhouette */}
        <path d="M48 85 L64 72 L80 85 Z" fill="#2d221c" />
        <rect x="54" y="85" width="20" height="22" fill="#2d221c" />
        
        <polygon points="84,115 84,52 104,24 124,52 124,115" fill="#2d221c" />

        {/* Open Bible */}
        <path d="M38 112 Q66 98 100 112 Q134 98 162 112 L162 136 Q134 122 100 136 Q66 122 38 136 Z" fill="#2d221c" />
        <path d="M41 114 Q66 100 100 114 Q134 100 159 114 L159 133 Q134 119 100 133 Q66 119 41 133 Z" fill="#f8fafc" />
        <line x1="100" y1="114" x2="100" y2="133" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="52" y1="119" x2="82" y2="119" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="124" x2="77" y2="124" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="118" y1="119" x2="148" y2="119" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="118" y1="124" x2="143" y2="124" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

        {/* IBC Typography */}
        <text x="128" y="70" fontFamily="Georgia, serif" fontSize="40" fontWeight="bold" fill="#2d221c" letterSpacing="1">IBC</text>
        <text x="105" y="88" fontFamily="sans-serif" fontSize="14" fill="#2d221c" fontStyle="italic" fontWeight="600">Iglesia</text>
        <text x="44" y="108" fontFamily="sans-serif" fontSize="16" fill="#2d221c" fontStyle="italic" fontWeight="600">Bautista Central</text>

        {/* Coral-Orange Ribbon Banner at Bottom */}
        <path d="M 18 152 Q 100 140 182 152 L 176 178 Q 100 166 24 178 Z" fill="#e07252" stroke="#b54929" strokeWidth="1.5" />
        <polygon points="12,165 24,152 24,178" fill="#c45533" />
        <polygon points="188,165 176,152 176,178" fill="#c45533" />

        {/* Ribbon text */}
        <text x="100" y="168" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold" fill="#ffffff" textAnchor="middle" letterSpacing="0.4">El Amor hace la diferencia</text>
      </svg>
    </div>
  );
};
