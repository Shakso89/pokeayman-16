
import { createContext, useContext, useState } from "react";

interface LanguageContextType {
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
  language: string;
  i18n: {
    dir: () => "ltr" | "rtl";
  };
}

// Create a context with default values
const LanguageContext = createContext<LanguageContextType>({
  t: (key) => key,
  changeLanguage: () => {},
  language: "en",
  i18n: {
    dir: () => "ltr",
  },
});

// Sample translations
const translations: Record<string, Record<string, string>> = {
  en: {
    "back": "Back",
    "manage-classes": "Manage Classes",
    "class-management": "Class Management",
    "your-classes": "Your Classes",
    "create-class-in-any-school": "Create Class In Any School",
    // Add more translations as needed
  },
  // Add more languages as needed
};

// Provider component
export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const i18n = {
    dir: () => language === "ar" ? "rtl" : "ltr" as "ltr" | "rtl",
  };

  return (
    <LanguageContext.Provider value={{ t, changeLanguage, language, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useTranslation = () => {
  return useContext(LanguageContext);
};
