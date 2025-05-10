
import React from "react";
import { useNavigate } from "react-router-dom";
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
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "./LanguageSelector";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="w-full bg-white/10 backdrop-blur-md py-4 px-6 flex justify-between items-center">
      <div 
        className="text-white text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        PokéAyman
      </div>
      
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/20"
        >
          <Home size={20} />
        </Button>
        
        <LanguageSelector className="text-white hover:bg-white/20" />
        
        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20">{t("sign-in")}</NavigationMenuTrigger>
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
                        {t("teacher-login")}
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
                        {t("student-login")}
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
                  {t("contact-us")}
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
