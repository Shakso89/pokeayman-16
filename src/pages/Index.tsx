
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-12">
          <img 
            src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" 
            alt="PokéAyman Logo" 
            className="h-32 md:h-40 w-auto"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6))" }}
          />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {t("welcome-to-pokeayman")}
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            {t("pokeayman-description")}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center mb-16">
          <Button 
            size="lg" 
            onClick={() => navigate("/teacher-login")} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            {t("teacher-login")}
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/student-login")} 
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white px-8 py-6 text-lg"
          >
            {t("student-login")}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3">{t("feature-1-title")}</h3>
            <p>{t("feature-1-desc")}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3">{t("feature-2-title")}</h3>
            <p>{t("feature-2-desc")}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3">{t("feature-3-title")}</h3>
            <p>{t("feature-3-desc")}</p>
          </div>
        </div>

        {/* Added Pokémon image showcase */}
        <div className="flex justify-center flex-wrap gap-8 mb-16">
          <img 
            src="/lovable-uploads/6b6ad061-baa5-438e-a631-131fbfe0eafc.png" 
            alt="Pikachu" 
            className="h-48 w-auto drop-shadow-lg animate-bounce" 
            style={{ animationDuration: "3s" }}
          />
          <img 
            src="/lovable-uploads/2c72122a-ed62-4276-b90f-0f0688bf9693.png" 
            alt="Charizard" 
            className="h-64 w-auto drop-shadow-lg animate-pulse" 
            style={{ animationDuration: "4s" }}
          />
          <img 
            src="/lovable-uploads/d1c806ec-9607-4d94-af2a-bdbb8d2cb0c6.png" 
            alt="Bulbasaur" 
            className="h-48 w-auto drop-shadow-lg animate-bounce" 
            style={{ animationDuration: "3.5s" }}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
