
import { useState, useEffect } from "react";
import { translate, getCurrentLanguage } from "@/utils/translations";

export const useTranslation = () => {
  const [language, setLanguage] = useState<"en" | "zh">(getCurrentLanguage());
  
  useEffect(() => {
    // Listen for language changes
    const handleStorageChange = () => {
      setLanguage(getCurrentLanguage());
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  const t = (key: string) => translate(key, language);
  
  return {
    t,
    language,
    setLanguage: (lang: "en" | "zh") => {
      localStorage.setItem("language", lang);
      setLanguage(lang);
    }
  };
};
