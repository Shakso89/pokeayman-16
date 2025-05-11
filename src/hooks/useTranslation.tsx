
import { useState } from "react";

export const useTranslation = () => {
  // Simple implementation that just returns the key - no actual translation
  const t = (key: string) => key;
  
  return {
    t,
    language: "en" as const,
    setLanguage: () => {}
  };
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <>{children}</>;
};
