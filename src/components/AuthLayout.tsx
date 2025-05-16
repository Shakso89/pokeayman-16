
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Pokemon background */}
      <PokemonOrbit count={8} />
      
      <div className="w-full max-w-md z-10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
        >
          Back to Home
        </Button>
      
        <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
