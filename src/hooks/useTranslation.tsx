
import { useState } from "react";

export type Language = "en";

export const useTranslation = () => {
  // Simple implementation that just returns the key - no actual translation
  const t = (key: string) => {
    const translations: Record<string, string> = {
      // Add more translations as needed
      "manage-pokemon": "Manage Pokémon",
      "manage-pokemon-for": "Manage Pokémon for",
      "remove-pokemon-description": "Remove Pokémon from this student to return them to the school pool.",
      "pokemon-removed": "Pokémon Removed",
      "returned-to-pool": "has been returned to the school pool",
      "failed-to-remove-pokemon": "Failed to remove Pokémon",
      "no-pokemon-found": "No Pokémon found in this student's collection",
      "loading": "Loading...",
      "remove": "Remove"
    };
    
    return translations[key] || key;
  };
  
  return {
    t,
    language: "en" as const,
    setLanguage: () => {}
  };
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <>{children}</>;
};
