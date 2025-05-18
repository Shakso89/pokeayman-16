
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userType } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (isLoggedIn) {
      if (userType === 'teacher') {
        navigate("/teacher-dashboard");
      } else if (userType === 'student') {
        navigate("/student-dashboard");
      }
    }
  }, [isLoggedIn, userType, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8">
        {/* Left Section - Why PokéAyman */}
        <div className="flex-1 text-white flex flex-col justify-center p-4 md:p-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to PokéAyman!</h1>
          <p className="text-xl mb-8 max-w-xl">
            The fun and engaging way for students to learn through collecting and battling Pokémon cards!
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => navigate("/teacher-signup")} 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Register as Teacher
            </Button>
            <Button 
              onClick={() => navigate("/teacher-login")} 
              size="lg" 
              variant="outline"
              className="bg-white/20 text-white border-white hover:bg-white/30"
            >
              Teacher Login
            </Button>
            <Button 
              onClick={() => navigate("/student-login")} 
              size="lg" 
              variant="outline"
              className="bg-green-500/80 text-white border-green-400 hover:bg-green-600/80"
            >
              Student Login
            </Button>
          </div>
        </div>
        
        {/* Right Section - Pokémon Image */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
            alt="PokéAyman Featured"
            className="max-w-full h-auto max-h-96 drop-shadow-2xl animate-float"
            style={{ 
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              animation: 'float 3s ease-in-out infinite'
            }}
          />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white/10 backdrop-blur-md py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose PokéAyman?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Engaging Learning</h3>
              <p>Turn education into a fun adventure with Pokémon-themed rewards and challenges.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Track Progress</h3>
              <p>Teachers can easily monitor student activities and achievements through an intuitive dashboard.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Community Building</h3>
              <p>Connect with other teachers and schools to share best practices and resources.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900/50 backdrop-blur-md text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2025 PokéAyman. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
