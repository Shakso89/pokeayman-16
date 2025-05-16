import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PokemonOrbit from "@/components/PokemonOrbit";
import { useTranslation } from "@/hooks/useTranslation";
const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();

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
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex flex-col items-center">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl p-6">
        {/* Logo Section - Prominently Displayed */}
        <div className="w-full text-center mb-8 md:mb-12">
          <img src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" alt="PokéAyman Logo" style={{
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))'
        }} className="mx-auto h-32 md:h-36 w-auto animate-pulse object-scale-down" />
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full">
          {/* Left Side - Description */}
          <div className="md:w-1/2 text-left mb-8 md:mb-0 md:pr-8 py-px px-[15px] mx-[8px]">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Why PokéAyman?</h2>
            <p className="text-xl text-white/90 text-center mx-0 my-0 py-0 px-0">
              Turn everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards 
              to boost student motivation and make learning unforgettable. Join a new wave of 
              gamified education.
            </p>
          </div>

          {/* Right Side - Main Content */}
          <div className="md:w-1/2 flex flex-col items-center">
            <div className="text-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Gotta Catch 'Em All</h1>
            </div>
            
            {/* Pokemon orbit animation in the middle */}
            <div className="my-4 flex justify-center w-full">
              <PokemonOrbit />
            </div>
            
            {/* Call to action */}
            <div className="text-center mt-4 space-y-4">
              <Button onClick={() => navigate("/teacher-login")} className="pokemon-button text-white font-bold text-xl px-8 py-5 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 w-full md:w-auto mb-3">
                {t('teacher-login')}
              </Button>
              
              <Button onClick={() => navigate("/student-login")} className="pokemon-button text-white font-bold text-xl px-8 py-5 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-green-600 hover:bg-green-700 w-full md:w-auto">
                {t('student-login')}
              </Button>
              
              <p className="text-white mt-4">
                {t('join-community')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom right corner image */}
        <div className="absolute bottom-20 right-4 md:bottom-24 md:right-6 z-10">
          <img src="/lovable-uploads/463ff2eb-f43a-40df-9403-9f3de73005fd.png" alt="Ash and Pikachu" className="h-40 md:h-60 w-auto" />
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Index;