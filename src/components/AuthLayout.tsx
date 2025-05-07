
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-purple-400 p-4">
      <Card className={cn("w-full max-w-md shadow-xl", className)}>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png"
              alt="TR Ayman Logo"
              className="h-24 w-auto"
            />
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
