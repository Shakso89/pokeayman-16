
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const AuthLayout = ({
  children,
  title,
  description,
  footer,
  className,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4" 
         style={{backgroundImage: "url('/lovable-uploads/df7b9259-e876-46a6-9b71-00aa60971cbf.png')"}}>
      <Card className={cn("w-full max-w-md shadow-xl border-none bg-white/90 backdrop-blur-sm", className)}>
        <CardHeader>
          <div className="flex justify-center mb-4 relative">
            <img
              src="/lovable-uploads/3e3a2694-943e-4281-80c9-f08239485026.png"
              alt="TR Ayman Logo"
              className="h-32 w-auto z-10"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/60 rounded-full -z-10 animate-pulse"></div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          {description && (
            <CardDescription className="text-center">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
};
