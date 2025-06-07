import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit";
interface AuthLayoutProps {
  title: string;
  description?: string; // Made description optional
  children: ReactNode;
  className?: string;
}
export const AuthLayout = ({
  title,
  description,
  children,
  className
}: AuthLayoutProps) => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Pokemon background */}
      <PokemonOrbit count={8} />
      
      <div className="w-full max-w-md z-10">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mb-6 glass-card border-white/30 hover:bg-white/30 text-slate-900">
          Back to Home
        </Button>
      
        <Card className={`glass-card border-white/20 shadow-xl ${className || ""}`}>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h1>
            {description && <p className="text-center text-gray-600 mb-6">{description}</p>}
            {children}
          </CardContent>
        </Card>
      </div>
    </div>;
};