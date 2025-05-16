
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PokemonOrbitProps {
  count?: number;
  className?: string;
}

const PokemonOrbit: React.FC<PokemonOrbitProps> = ({ count = 12, className }) => {
  const pokemonIcons = Array.from({ length: count }).map((_, i) => (
    <motion.div
      key={i}
      className={cn(
        "absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-contain bg-center bg-no-repeat",
        className
      )}
      style={{
        backgroundImage: `url(/pokeball.png)`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 40 - 20, 0],
        y: [0, Math.random() * 40 - 20, 0],
        rotate: [0, Math.random() * 360, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pokemonIcons}
    </div>
  );
};

export default PokemonOrbit;
