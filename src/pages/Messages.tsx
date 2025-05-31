import React, { memo } from "react";
import { NavBar } from "@/components/NavBar";

interface MessagesProps {
  userType?: "teacher" | "student";
  userName?: string;
}

const Messages: React.FC<MessagesProps> = ({ userType = "teacher", userName = "User" }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType={userType} userName={userName} />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="text-gray-600">Messages functionality is not yet implemented.</div>
      </main>
    </div>
  );
};

export default memo(Messages);
