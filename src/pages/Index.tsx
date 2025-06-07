
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import Footer from "@/components/Footer";
import ContactDialog from "@/components/signup/ContactDialog";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Animated clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-80 animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-10 bg-white rounded-full opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-32 left-1/3 w-24 h-14 bg-white rounded-full opacity-75 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-40 right-1/3 w-18 h-11 bg-white rounded-full opacity-80 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" 
            alt="PokéAyman Logo" 
            className="h-16 w-auto drop-shadow-lg" 
          />
          <span className="text-2xl font-bold text-yellow-300 drop-shadow-md">PokéAyman</span>
        </div>
        
        <div className="flex gap-6 text-white font-medium">
          <button className="hover:text-yellow-300 transition-colors">Home</button>
          <button className="hover:text-yellow-300 transition-colors">Start</button>
          <button className="hover:text-yellow-300 transition-colors">Store</button>
          <button 
            onClick={() => setContactOpen(true)}
            className="hover:text-yellow-300 transition-colors"
          >
            Contact
          </button>
          <button className="hover:text-yellow-300 transition-colors">Series</button>
          <Button 
            variant="outline" 
            className="bg-white text-blue-600 border-white hover:bg-gray-100"
            onClick={() => navigate("/teacher-login")}
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            PokéAyman E-poational
            <br />
            <span className="text-yellow-300">Educational Magique</span>
          </h1>
          
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
            Pokémon management of the educational via our Pokémon 
            and create to gate all students for E-year.
          </p>

          <Button 
            size="lg" 
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold text-xl px-12 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
            onClick={() => navigate("/teacher-signup")}
          >
            Start Now
          </Button>
        </div>

        {/* Main Scene with Pokémon */}
        <div className="relative mt-16 h-96">
          {/* Landscape background */}
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-green-400 to-green-300 rounded-t-3xl"></div>
          
          {/* Trees */}
          <div className="absolute bottom-16 left-20 w-24 h-32 bg-green-600 rounded-full"></div>
          <div className="absolute bottom-16 right-20 w-28 h-36 bg-green-600 rounded-full"></div>
          <div className="absolute bottom-16 left-1/4 w-20 h-28 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-16 right-1/4 w-26 h-34 bg-green-500 rounded-full"></div>

          {/* Path */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-48 bg-yellow-200 rounded-full opacity-80 skew-y-12"></div>

          {/* Pokémon Characters */}
          <img 
            src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" 
            alt="Pikachu" 
            className="absolute bottom-32 right-1/3 h-32 w-auto animate-bounce drop-shadow-lg" 
            style={{animationDuration: '3s'}}
          />
          
          <img 
            src="/lovable-uploads/be64cb1f-6989-4838-8064-d1a749d90ef8.png" 
            alt="Ash and Pikachu" 
            className="absolute bottom-24 left-1/3 h-40 w-auto drop-shadow-lg"
          />

          {/* Pokéball */}
          <div className="absolute bottom-40 left-16 w-16 h-16 bg-red-500 rounded-full border-4 border-white">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-black"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-black"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-800 to-purple-800 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            CLACKI'S TIME!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/d1c806ec-9607-4d94-af2a-bdbb8d2cb0c6.png" 
                  alt="Bulbasaur" 
                  className="h-16 w-16 mr-4"
                />
                <h3 className="text-xl font-bold">DESERATIMES</h3>
              </div>
              <p className="mb-4">
                Trial of pokét our call actions to appearcelt our story finalens 
                what our to leagan cant the penguin depolu.
              </p>
              <select className="w-full p-2 rounded bg-white text-black mb-2">
                <option>Comet</option>
              </select>
              <select className="w-full p-2 rounded bg-white text-black mb-2">
                <option>Ferraly</option>
              </select>
              <input 
                type="text" 
                placeholder="........"
                className="w-full p-2 rounded bg-white text-black mb-4"
              />
              <input 
                type="text" 
                placeholder="Candhow"
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">LETRASSTOREK</h3>
              <p className="mb-4">
                Win you some lost pirstions 
                natwour and boys after. 
                The fight is classes paper with 
                our care does breathing the 
                pour sapping you.
              </p>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold">
                Start Now
              </Button>
            </div>

            {/* Feature 3 */}
            <div className="bg-pink-400 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-800">CLIP FOR EVIOUS</h3>
                <img 
                  src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" 
                  alt="Pikachu" 
                  className="h-12 w-12"
                />
              </div>
              <p className="text-blue-800 mb-4">
                They cage the capital not hero 
                and at alert sure cafés clother. 
                Regla spony crack. 
                Educating you so I 
                provision to Festival.
              </p>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold">
                Exit more
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 bg-green-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/b42f1e48-b772-4523-8290-871c5575c64d.png" 
              alt="Charizard" 
              className="h-20 w-auto"
            />
            <div>
              <h3 className="text-2xl font-bold text-blue-800">Join PokéAyman</h3>
              <p className="text-blue-700">This done you, Poacher, at Tarimon ally card!</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/student-login")} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
            >
              {t("student-login")}
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/teacher-login")} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4"
            >
              {t("teacher-login")}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      
      <ContactDialog 
        isOpen={contactOpen} 
        onClose={() => setContactOpen(false)} 
      />
    </div>
  );
};

export default Index;
