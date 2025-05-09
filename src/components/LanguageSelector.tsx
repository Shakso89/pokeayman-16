
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export type Language = "en" | "zh";

interface LanguageSelectorProps {
  onChange?: (language: Language) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onChange, className }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("language") as Language || "en";
    setLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    if (onChange) {
      onChange(lang);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={language === "en" ? "bg-gray-100" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("zh")}
          className={language === "zh" ? "bg-gray-100" : ""}
        >
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
