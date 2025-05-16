import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();

  // Check if user is already logged in using Supabase Auth
  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        // Check if user is a teacher or student
        const {
          data: teacher
        } = await supabase.from('teachers').select('*').eq('id', session.user.id).maybeSingle();
        if (teacher) {
          navigate("/teacher-dashboard");
          return;
        }
        const {
          data: student
        } = await supabase.from('students').select('*').eq('id', session.user.id).maybeSingle();
        if (student) {
          navigate("/student-dashboard");
        }
      }
    };
    checkAuthStatus();
  }, [navigate]);
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex flex-col">
      {/* Navigation Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" alt="PokéAyman Logo" className="h-12 w-auto" />
        </div>
        
        <div className="flex items-center gap-4 text-white">
          <a href="/" className="hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </a>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:underline">
              Sign In <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="py-1">
                <button onClick={() => navigate("/teacher-login")} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Teacher Login
                </button>
                <button onClick={() => navigate("/student-login")} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Student Login
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/contact")} className="hover:underline">
            Contact Us
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Left Section - Why PokéAyman */}
        <div className="w-1/2 flex flex-col justify-center px-16">
          <h1 className="text-4xl font-bold text-white mb-4">Why PokéAyman?</h1>
          <p className="text-white text-lg leading-relaxed">
            Turn everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards to boost student motivation and make learning unforgettable. Join a new wave of gamified education.
          </p>
        </div>
        
        {/* Right Section - Call to Action */}
        <div className="w-1/2 flex flex-col justify-center items-center px-16 relative">
          <h1 className="text-6xl font-bold text-white mb-12">Gotta Catch 'Em All</h1>
          
          <img src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" alt="PokéAyman Logo" className="h-32 w-auto mb-12 object-scale-down" />
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button onClick={() => navigate("/teacher-login")} className="bg-red-500 hover:bg-red-600 text-white text-lg py-6 rounded-full font-bold">
              {t('teacher-login')}
            </Button>
            
            <Button onClick={() => navigate("/student-login")} className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-full font-bold">
              {t('student-login')}
            </Button>
            
            <button onClick={() => navigate("/contact")} className="text-white mt-4 hover:underline">
              join-community
            </button>
          </div>
          
          {/* Ash and Pikachu Image */}
          <div className="absolute bottom-0 right-0">
            <img src="/lovable-uploads/463ff2eb-f43a-40df-9403-9f3de73005fd.png" alt="Ash and Pikachu" className="h-60 w-auto object-fill" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white">
        <img alt="Jigglypuff" src="/lovable-uploads/80af40fc-49c4-4da9-a3a8-813841541122.png" className="h-60 w-auto mx-auto mb-2" />
        <p>© 2025 PokéAyman. All rights reserved</p>
        <button onClick={() => navigate("/contact")} className="text-white mt-2 hover:underline">
          Contact Us
        </button>
      </footer>
    </div>;
};
export default Index;