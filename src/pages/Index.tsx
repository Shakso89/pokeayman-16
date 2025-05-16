
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PokemonOrbit from "@/components/PokemonOrbit";
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

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-6 py-12 relative">
        {/* Main Logo - Centered and Prominent */}
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/abda00b4-ad35-4edb-9061-005331ccb361.png" 
            alt="PokéAyman Logo" 
            className="mx-auto h-40 md:h-48 w-auto animate-pulse"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }}
          />
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8 items-center">
          {/* Left Side - Description */}
          <div className="md:w-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Why PokéAyman?</h2>
            <p className="text-xl text-white text-center">
              Turn everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards 
              to boost student motivation and make learning unforgettable. Join a new wave of 
              gamified education.
            </p>
          </div>

          {/* Right Side - Main Content */}
          <div className="md:w-1/2 flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Gotta Catch 'Em All</h1>
            </div>
            
            {/* Pokemon orbit animation */}
            <div className="relative h-40 w-full my-4 flex justify-center">
              <PokemonOrbit count={8} />
            </div>
            
            {/* Call to action */}
            <div className="text-center mt-6 space-y-4 w-full">
              <Button 
                onClick={() => navigate("/teacher-login")} 
                className="pokemon-button text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 w-full md:w-auto mb-3"
              >
                {t('teacher-login')}
              </Button>
              
              <Button 
                onClick={() => navigate("/student-login")} 
                className="pokemon-button text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-green-600 hover:bg-green-700 w-full md:w-auto"
              >
                {t('student-login')}
              </Button>
              
              <p className="text-white mt-4">
                {t('join-community')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom right corner image */}
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10">
          <img src="/lovable-uploads/463ff2eb-f43a-40df-9403-9f3de73005fd.png" alt="Ash and Pikachu" className="h-28 md:h-40 w-auto" />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
