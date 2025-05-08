
import React from "react";
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
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default Header;
