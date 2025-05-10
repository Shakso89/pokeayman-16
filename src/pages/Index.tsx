
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

      <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl p-6">
        {/* Left Side - Description */}
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:pr-8">
          <h2 className="text-3xl font-bold text-white mb-4">Why PokéAyamn?</h2>
          <p className="text-xl text-white/90">
            Turn everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards 
            to boost student motivation and make learning unforgettable. Join a new wave of 
            gamified education.
          </p>
        </div>

        {/* Right Side - Main Content */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Gotta Catch 'Em All</h1>
            
            {/* PokéAyman logo under heading */}
            <img 
              src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
              alt="PokéAyman Logo" 
              className="mx-auto h-20 w-auto mb-6"
            />
          </div>
          
          {/* Pokemon orbit animation in the middle */}
          <div className="my-4 flex justify-center w-full">
            <PokemonOrbit />
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-4">
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

        {/* Bottom right corner image */}
        <div className="absolute bottom-20 right-4 md:bottom-24 md:right-6 z-10">
          <img 
            src="/lovable-uploads/463ff2eb-f43a-40df-9403-9f3de73005fd.png"
            alt="Ash and Pikachu" 
            className="h-40 md:h-60 w-auto"
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
