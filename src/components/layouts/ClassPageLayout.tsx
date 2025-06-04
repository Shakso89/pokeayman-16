
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
    <div className="min-h-screen bg-gray-50">
      <NavBar userType={userType} userName={userName} />
      {children}
    </div>
  );
};

export default ClassPageLayout;
