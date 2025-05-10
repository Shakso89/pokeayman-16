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
  className
}: AuthLayoutProps) => {
  return <div className="flex min-h-screen items-center justify-center p-4">
      <Card className={cn("w-full max-w-md shadow-xl border-none backdrop-blur-md", className)}>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img alt="TR Ayman Logo" className="h-32 w-auto z-10" src="/lovable-uploads/a5425bcb-d7d0-4434-81fc-e434f4eb0c42.png" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          {description && <CardDescription className="text-center">{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>;
};