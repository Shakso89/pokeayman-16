
import { useState, useEffect, createContext, useContext } from "react";
import { translate, getCurrentLanguage } from "@/utils/translations";

type LanguageContextType = {
  language: "en" | "zh";
  setLanguage: (lang: "en" | "zh") => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<"en" | "zh">(getCurrentLanguage());
  
  useEffect(() => {
    // Listen for language changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language") {
        setLanguage((e.newValue as "en" | "zh") || "en");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also set up a local event listener for components to communicate
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail && e.detail.language) {
        setLanguage(e.detail.language);
      }
    };
    
    window.addEventListener("languageChange" as any, handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageChange" as any, handleCustomEvent as EventListener);
    };
  }, []);
  
  const t = (key: string) => translate(key, language);
  
  const setAppLanguage = (lang: "en" | "zh") => {
    localStorage.setItem("language", lang);
    setLanguage(lang);
    
    // Dispatch custom event for other components to listen to
    const event = new CustomEvent("languageChange", {
      detail: { language: lang }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: setAppLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  // If not within provider, fallback to basic implementation
  if (!context) {
    const [language, setLanguage] = useState<"en" | "zh">(getCurrentLanguage());
  
    useEffect(() => {
      // Listen for language changes
      const handleStorageChange = () => {
        setLanguage(getCurrentLanguage());
      };
      
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("languageChange" as any, handleStorageChange as EventListener);
      
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("languageChange" as any, handleStorageChange as EventListener);
      };
    }, []);
    
    const t = (key: string) => translate(key, language);
    
    return {
      t,
      language,
      setLanguage: (lang: "en" | "zh") => {
        localStorage.setItem("language", lang);
        setLanguage(lang);
        
        // Dispatch custom event for other components
        const event = new CustomEvent("languageChange", {
          detail: { language: lang }
        });
        window.dispatchEvent(event);
      }
    };
  }
  
  return context;
};
