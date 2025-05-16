
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PokemonOrbit from "@/components/PokemonOrbit";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user is already logged in using Supabase Auth
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user is a teacher or student
        const { data: teacher } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (teacher) {
          navigate("/teacher-dashboard");
          return;
        }
        
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (student) {
          navigate("/student-dashboard");
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex flex-col items-center">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl p-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo Section - Scaled to 1/4 of the vertical screen space */}
          <div className="w-full md:w-1/4 flex items-center justify-center mb-8 md:mb-0">
            <img 
              src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" 
              alt="PokéAyman Logo" 
              className="max-h-24 md:max-h-32 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' }}
            />
          </div>

          {/* Main Content - Taking 2/4 of the space */}
          <div className="w-full md:w-2/4 flex flex-col">
            <div className="text-center mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gotta Catch 'Em All</h1>
              <p className="text-xl text-white/90">
                Turn everyday lessons into exciting adventures with Pokémon!
              </p>
            </div>
            
            {/* Pokemon orbit animation */}
            <div className="relative h-32 md:h-40 my-4">
              <PokemonOrbit />
            </div>
            
            {/* Call to action */}
            <div className="text-center mt-4 space-y-4">
              <Button onClick={() => navigate("/teacher-login")} className="pokemon-button text-white font-bold text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 w-full md:w-auto mb-3">
                {t('teacher-login')}
              </Button>
              
              <Button onClick={() => navigate("/student-login")} className="pokemon-button text-white font-bold text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 bg-green-600 hover:bg-green-700 w-full md:w-auto">
                {t('student-login')}
              </Button>
              
              <p className="text-white mt-4">
                {t('join-community')}
              </p>
            </div>
          </div>

          {/* Why PokéAyman - Taking remaining space */}
          <div className="w-full md:w-1/4 bg-white/10 backdrop-blur-md p-4 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-2 text-center">Why PokéAyman?</h2>
            <p className="text-white/90 text-sm">
              Boost student motivation with Pokémon, challenges, and rewards.
              Join a new wave of gamified education that makes learning unforgettable!
            </p>
          </div>
        </div>

        {/* Bottom right corner image */}
        <div className="absolute bottom-20 right-4 md:bottom-24 md:right-6 z-10">
          <img src="/lovable-uploads/463ff2eb-f43a-40df-9403-9f3de73005fd.png" alt="Ash and Pikachu" className="h-32 md:h-40 w-auto" />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
