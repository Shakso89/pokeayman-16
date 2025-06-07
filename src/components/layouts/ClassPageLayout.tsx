
import React from "react";
import { NavBar } from "@/components/NavBar";

interface ClassPageLayoutProps {
  children: React.ReactNode;
  userType: "teacher" | "student";
  userName: string;
}

const ClassPageLayout: React.FC<ClassPageLayoutProps> = ({
  children,
  userType,
  userName
}) => {
  return (
    <div className="min-h-screen">
      <NavBar userType={userType} userName={userName} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ClassPageLayout;
