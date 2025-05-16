
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PokemonOrbitProps {
  count?: number;
  className?: string;
}

const PokemonOrbit: React.FC<PokemonOrbitProps> = ({ count = 6, className }) => {
  // Create pokeball positions in a more structured orbit pattern
  const pokeballPositions = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 40 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y, delay: i * 0.2 };
  });

  return (
    <div className="relative w-full h-full overflow-hidden">
      {pokeballPositions.map((position, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-8 h-8 md:w-10 md:h-10 rounded-full bg-contain bg-center bg-no-repeat",
            className
          )}
          style={{
            backgroundImage: `url(/pokeball.png)`,
            left: "50%",
            top: "50%",
          }}
          initial={{ 
            x: position.x, 
            y: position.y 
          }}
          animate={{
            x: [position.x, -position.x, position.x],
            y: [position.y, -position.y, position.y],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "linear",
            delay: position.delay,
          }}
        />
      ))}
    </div>
  );
};

export default PokemonOrbit;
