
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PokemonOrbit from "@/components/PokemonOrbit";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    
    if (isLoggedIn && userType === "teacher") {
      navigate("/teacher-dashboard");
    } else if (isLoggedIn && userType === "student") {
      navigate("/student-dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex flex-col items-center">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl p-6">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('welcome')}</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('platform-description')}
          </p>
        </div>
        
        {/* Language selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector className="text-white hover:bg-white/20" />
        </div>
        
        {/* Pokemon orbit animation - centered and larger */}
        <div className="my-8 flex justify-center w-full">
          <PokemonOrbit />
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate("/student-login")} 
            className="bg-pokemon-red hover:bg-red-600 text-white font-bold text-xl px-10 py-6 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 animate-pulse"
          >
            {t('get-started')}
          </Button>
          
          <p className="text-white mt-4">
            {t('join-community')}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
