import React, { useState } from 'react';
import logoPng from '../../assets/logo_ibc.png';

interface IBCLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBorder?: boolean;
}

export const IBCLogo: React.FC<IBCLogoProps> = ({ 
  className = '', 
  size = 'md',
  showBorder = false
}) => {
  const [hasError, setHasError] = useState(false);

  const dimensions = 
    size === 'xs' ? 'w-7 h-7' :
    size === 'sm' ? 'w-9 h-9' : 
    size === 'md' ? 'w-11 h-11' : 
    size === 'lg' ? 'w-16 h-16' : 
    size === 'xl' ? 'w-24 h-24' : 
    size === '2xl' ? 'w-32 h-32' :
    'w-11 h-11';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      <img
        src={hasError ? '/logo_ibc.png' : logoPng}
        alt="Logo Oficial IBC Bogotá - El Amor hace la diferencia"
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain filter drop-shadow-md select-none transition-transform hover:scale-105 ${
          showBorder ? 'ring-2 ring-emerald-500/40 p-1 bg-white/10 backdrop-blur-xs rounded-2xl shadow-sm' : ''
        }`}
        loading="eager"
      />
    </div>
  );
};
