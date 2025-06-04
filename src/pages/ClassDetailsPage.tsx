
import React from "react";
import { NavBar } from "@/components/NavBar";
import ClassDetails from "@/components/class-details/ClassDetails";

const ClassDetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userType="teacher" userName="Teacher" />
      <ClassDetails />
    </div>
  );
};

export default ClassDetailsPage;
