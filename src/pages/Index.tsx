
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PokemonOrbit from "@/components/PokemonOrbit";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to PokéAyman</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your interactive Pokemon-based learning platform for students and teachers
          </p>
        </div>
        
        {/* Pokemon orbit animation */}
        <PokemonOrbit />
        
        {/* Call to action */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate("/student-login")} 
            className="bg-pokemon-red hover:bg-red-600 text-white font-bold text-xl px-10 py-6 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-105 animate-pulse"
          >
            Get Started
          </Button>
          
          <p className="text-white mt-4">
            Join our community of educators and students
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
