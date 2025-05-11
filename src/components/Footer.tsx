
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-white/10 backdrop-blur-md py-6 text-center text-white">
      <div className="container mx-auto">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
            alt="PokéAyman Logo" 
            className="h-12 w-auto cursor-pointer hover:scale-110 transition-transform"
            onClick={() => navigate("/")}
          />
        </div>
        <p>© 2025 PokéAyman. {t("all-rights-reserved")}</p>
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={() => navigate("/contact")}
            className="text-white hover:text-blue-200 transition-colors"
          >
            {t("contact-us")}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
