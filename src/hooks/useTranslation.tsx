
import React, { createContext, useState, useContext, useEffect } from "react";
import { translate, getCurrentLanguage, changeLanguage } from "@/utils/translations";

type LanguageContextType = {
  language: "en" | "zh";
  t: (key: string) => string;
  setLanguage: (lang: "en" | "zh") => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: (key: string) => key,
  setLanguage: () => {},
});

export const useTranslation = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<"en" | "zh">(getCurrentLanguage());

  const t = (key: string): string => {
    return translate(key, language);
  };

  const setLanguage = (newLanguage: "en" | "zh") => {
    setLanguageState(newLanguage);
    changeLanguage(newLanguage);
  };

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setLanguageState(customEvent.detail.language);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
