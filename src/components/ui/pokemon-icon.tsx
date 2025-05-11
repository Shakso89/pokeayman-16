
import React from "react";

interface PokemonIconProps {
  className?: string;
  size?: number;
}

const PokemonIcon: React.FC<PokemonIconProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="22" />
      <line x1="22" y1="12" x2="15" y2="12" />
      <line x1="9" y1="12" x2="2" y2="12" />
    </svg>
  );
};

export default PokemonIcon;
