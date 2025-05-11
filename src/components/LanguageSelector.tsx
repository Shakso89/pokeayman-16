
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  // No functionality needed since translation was removed
  return (
    <Button variant="ghost" size="icon" className={className}>
      <Globe size={20} />
    </Button>
  );
};

export default LanguageSelector;
