import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import Footer from "@/components/Footer";
const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-12">
          <img src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" alt="PokéAyman Logo" className="h-32 md:h-40 w-auto" style={{
          filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6))"
        }} />
        </div>
        
        <div className="text-center mb-12">
          <div className="relative">
            
          </div>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto mb-8">
            Turn everyday lessons into exciting adventures! Use Pokémon, challenges, and rewards to boost student motivation and make learning unforgettable. Join a new wave of gamified education.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center mb-16">
          <Button size="lg" onClick={() => navigate("/teacher-login")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            {t("teacher-login")}
          </Button>
          
          <Button size="lg" variant="outline" onClick={() => navigate("/student-login")} className="backdrop-blur-sm text-white border-white px-8 py-6 text-lg bg-purple-800 hover:bg-purple-700">
            {t("student-login")}
          </Button>
        </div>
        
        {/* Why Choose PokéAyman Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
            Why Choose PokéAyman?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Engaging Learning</h3>
              <p>Turn education into a fun adventure with Pokémon-themed rewards and challenges.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Track Progress</h3>
              <p>Teachers can easily monitor student activities and achievements through an intuitive dashboard.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Community Building</h3>
              <p>Connect with other teachers and schools to share best practices and resources.</p>
            </div>
          </div>
        </div>

        {/* Ash and Pikachu hero image */}
        <div className="flex justify-center mb-8">
          <img alt="Ash and Pikachu" style={{
          filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 0.3))"
        }} src="/lovable-uploads/be64cb1f-6989-4838-8064-d1a749d90ef8.png" className="h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl object-scale-down" />
        </div>

        {/* Pokémon image showcase */}
        <div className="flex justify-center flex-wrap gap-8 mb-16">
          <img alt="Pikachu" className="h-48 w-auto drop-shadow-lg animate-bounce" style={{
          animationDuration: "3s"
        }} src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" />
          <img src="/lovable-uploads/2c72122a-ed62-4276-b90f-0f0688bf9693.png" alt="Charizard" className="h-64 w-auto drop-shadow-lg animate-pulse" style={{
          animationDuration: "4s"
        }} />
          <img src="/lovable-uploads/d1c806ec-9607-4d94-af2a-bdbb8d2cb0c6.png" alt="Bulbasaur" className="h-48 w-auto drop-shadow-lg animate-bounce" style={{
          animationDuration: "3.5s"
        }} />
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Index;