
import React from "react";
import { NavBar } from "@/components/NavBar";

export const Messages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="teacher" 
        userName="User" 
      />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <p>Messages functionality is not yet implemented.</p>
      </div>
    </div>
  );
};

export default Messages;
