
import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Facebook, Phone } from "lucide-react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const PokemonOrbit = () => {
  const orbitRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const pokemonCount = 12;
  const pokemonImages = [
    "/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png", // Your logo (will be in the center)
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Pikachu
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", // Bulbasaur  
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", // Charmander
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", // Squirtle
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", // Jigglypuff
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png", // Eevee
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png", // Psyduck
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", // Snorlax
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png", // Magikarp
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", // Gengar
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", // Mewtwo
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png", // Mew
  ];

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    
    let animationId: number;
    let rotation = 0;
    
    const animate = () => {
      rotation += 0.2;
      if (orbit) {
        orbit.style.transform = `rotate(${rotation}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] mb-8">
      {/* Center logo - now clickable */}
      <div 
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
        onClick={() => navigate('/student-login')}
      >
        <img 
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" 
          alt="PokéAyman Logo" 
          className="h-40 w-auto"
        />
      </div>
      
      {/* Orbiting Pokemon */}
      <div 
        ref={orbitRef}
        className="absolute w-full h-full left-0 top-0"
      >
        {Array.from({ length: pokemonCount }).map((_, i) => {
          const angle = (i / pokemonCount) * 2 * Math.PI;
          const radius = 160; // Distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const pokemonImg = pokemonImages[(i % pokemonImages.length) + 1]; // Skip the first image (logo)
          
          return (
            <div 
              key={i}
              className="absolute pokemon-orbit-item transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <img 
                src={pokemonImg} 
                alt={`Pokemon ${i}`} 
                className="h-16 w-16 object-contain transform -rotate-[var(--rotation)]"
                style={{ transform: `rotate(-${(i / pokemonCount) * 360}deg)` }} // Counter-rotate to keep pokemon upright
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  
  // Check if user is already logged in
  React.useEffect(() => {
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
      {/* Top Nav with Sign In and Contact Info */}
      <div className="w-full bg-white/10 backdrop-blur-md py-4 px-6 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">PokéAyman</div>
        
        <div className="flex items-center gap-6">
          {/* Contact Info */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="https://www.facebook.com/ayman.soliman89/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span>ayman.soliman89</span>
            </a>
            
            <a 
              href="tel:+886900170038" 
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>+886 900 170 038</span>
            </a>
          </div>
          
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20">Sign In</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          onClick={() => navigate("/teacher-login")}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "cursor-pointer flex items-center justify-start gap-2"
                          )}
                        >
                          Teacher Login
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          onClick={() => navigate("/student-login")}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "cursor-pointer flex items-center justify-start gap-2"
                          )}
                        >
                          Student Login
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20">Contact</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[250px]">
                    <li className="flex flex-col">
                      <span className="font-medium">Facebook:</span>
                      <a 
                        href="https://www.facebook.com/ayman.soliman89/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        ayman.soliman89
                      </a>
                    </li>
                    <li className="flex flex-col">
                      <span className="font-medium">Phone / WhatsApp / Line:</span>
                      <a 
                        href="tel:+886900170038" 
                        className="text-blue-500 hover:underline"
                      >
                        +886 900 170 038
                      </a>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

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
      
      <footer className="w-full bg-white/10 backdrop-blur-md py-4 text-center text-white">
        <div className="container mx-auto">
          <p>© 2025 PokéAyman. All rights reserved.</p>
          <div className="flex justify-center mt-2 gap-4">
            <a 
              href="https://www.facebook.com/ayman.soliman89/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="tel:+886900170038" 
              className="text-white hover:text-blue-200 transition-colors"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
