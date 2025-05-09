
import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PokemonOrbit: React.FC = () => {
  const orbitRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const pokemonCount = 12;
  const pokemonImages = [
    "/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png", // Your logo (will be in the center)
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Pikachu
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", // Bulbasaur  
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", // Charmander
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", // Squirtle
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", // Jigglypuff
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png", // Eevee
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png", // Psyduck
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", // Snorlax
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png", // Magikarp
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", // Gengar
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", // Mewtwo
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png", // Mew
  ];

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    
    let animationId: number;
    let rotation = 0;
    
    const animate = () => {
      rotation += 0.2;
      if (orbit) {
        orbit.style.transform = `rotate(${rotation}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleLogoClick = () => {
    // Add a pulsing animation to the logo on click
    if (logoRef.current) {
      logoRef.current.classList.add('scale-pulse');
      setTimeout(() => {
        navigate('/student-login');
      }, 600);
    }
  };

  return (
    <div className="relative w-full h-[400px] mb-8">
      {/* Center logo - now clickable with animation */}
      <div 
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
        onClick={handleLogoClick}
      >
        <img 
          ref={logoRef}
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
          alt="PokéAyman Logo" 
          className="h-52 w-auto transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      {/* Orbiting Pokemon */}
      <div 
        ref={orbitRef}
        className="absolute w-full h-full left-0 top-0"
      >
        {Array.from({ length: pokemonCount }).map((_, i) => {
          const angle = (i / pokemonCount) * 2 * Math.PI;
          const radius = 180; // Increased distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const pokemonImg = pokemonImages[(i % pokemonImages.length) + 1]; // Skip the first image (logo)
          
          return (
            <div 
              key={i}
              className="absolute pokemon-orbit-item transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <img 
                src={pokemonImg} 
                alt={`Pokemon ${i}`} 
                className="h-16 w-16 object-contain hover:scale-125 transition-transform"
                style={{ transform: `rotate(-${(i / pokemonCount) * 360}deg)` }} // Counter-rotate to keep pokemon upright
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonOrbit;
