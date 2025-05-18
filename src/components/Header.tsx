
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in to determine where to redirect when home button is clicked
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  
  const handleHomeClick = () => {
    if (isLoggedIn && userType === "teacher") {
      navigate("/teacher-dashboard");
    } else if (isLoggedIn && userType === "student") {
      navigate("/student-dashboard");
    } else {
      navigate("/");
    }
  };
  
  return (
    <div className="w-full bg-white/10 backdrop-blur-md py-4 px-6 flex justify-between items-center">
      <div 
        className="cursor-pointer flex items-center"
        onClick={handleHomeClick}
      >
        <img 
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" 
          alt="PokéAyman" 
          className="h-14 w-auto"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }}
        />
      </div>
      
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleHomeClick}
          className="text-white hover:bg-white/20"
        >
          <Home size={20} />
        </Button>
        
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
              <NavigationMenuLink asChild>
                <a
                  onClick={() => navigate("/contact")}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "cursor-pointer bg-transparent text-white hover:bg-white/20"
                  )}
                >
                  Contact Us
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Header;

interface NavigationMenuLinkProps {
  asChild: boolean;
  children: React.ReactNode;
}

const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
  asChild,
  children
}) => {
  return <>{children}</>;
};
