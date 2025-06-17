import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { User, GraduationCap, UserPlus } from "@heroicons/react/24/outline";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <Header />
      
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-12">
              <img src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" alt="PokéAyman Logo" className="h-32 md:h-40 w-auto float-animation" style={{
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6))"
            }} />
            </div>
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="glass-card rounded-3xl p-8 mb-8 max-w-4xl mx-auto">
                
                <p className="text-lg max-w-3xl mx-auto mb-8 text-slate-600 font-normal md:text-3xl">
                  Transform everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards to boost student motivation and make learning unforgettable. Join a new wave of gamified education.
                </p>
                
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate("/teacher-login")}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Teacher Login
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate("/student-login")}
                  >
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Student Login
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate("/student-signup")}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Student Signup
                  </Button>
                </div>
              </div>
            </div>

            {/* Ash and Pikachu hero image */}
            <div className="flex justify-center mb-12">
              <img alt="Ash and Pikachu" style={{
              filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 0.3))"
            }} src="/lovable-uploads/be64cb1f-6989-4838-8064-d1a749d90ef8.png" className="h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl object-none float-animation" />
            </div>
            
            {/* Why Choose PokéAyman Section */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 animate-bounce text-slate-700">
                Why Choose PokéAyman? ✨
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card rounded-xl p-6 text-white hover:scale-105 transition-transform">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-xl font-bold mb-3 text-slate-700">Engaging Learning</h3>
                  <p className="text-2xl text-gray-600">Turn education into a fun adventure with Pokémon-themed rewards and challenges.</p>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-white hover:scale-105 transition-transform">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-3 text-slate-700">Track Progress</h3>
                  <p className="text-2xl text-gray-600">Teachers can easily monitor student activities and achievements through an intuitive dashboard.</p>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-white hover:scale-105 transition-transform">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-3 text-slate-700">Community Building</h3>
                  <p className="text-2xl text-gray-600">Connect with other teachers and schools to share best practices and resources.</p>
                </div>
              </div>
            </div>

            {/* Pokémon image showcase */}
            <div className="flex justify-center flex-wrap gap-8 mb-16">
              <img alt="Pikachu" className="h-48 w-auto drop-shadow-lg animate-bounce" style={{
              animationDuration: "3s",
              filter: "drop-shadow(0 0 15px rgba(255, 255, 0, 0.5))"
            }} src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" />
              <img alt="Charizard" style={{
              animationDuration: "4s",
              filter: "drop-shadow(0 0 15px rgba(255, 100, 0, 0.5))"
            }} src="/lovable-uploads/b42f1e48-b772-4523-8290-871c5575c64d.png" className="h-64 w-auto drop-shadow-lg animate-bounce" />
              <img src="/lovable-uploads/d1c806ec-9607-4d94-af2a-bdbb8d2cb0c6.png" alt="Bulbasaur" className="h-48 w-auto drop-shadow-lg animate-bounce" style={{
              animationDuration: "3.5s",
              filter: "drop-shadow(0 0 15px rgba(0, 255, 100, 0.5))"
            }} />
            </div>

            {/* Features showcase */}
            <div className="glass-card rounded-3xl p-8 mb-16 max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-slate-700">Experience the Adventure! 🌟</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🎒</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-700">Collect & Battle</h3>
                      <p className="text-gray-600">Students collect Pokémon as rewards and participate in educational battles.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-700">Achievement System</h3>
                      <p className="text-gray-600">Comprehensive ranking and achievement tracking for motivation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🎲</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-700">Mystery Rewards</h3>
                      <p className="text-gray-600">Surprise Pokémon rewards through our mystery ball system.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">⚡</div>
                  <p className="italic text-gray-600">"Learning has never been this exciting!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
