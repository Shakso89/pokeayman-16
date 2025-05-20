
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import ClassManagement from "@/components/teacher/class-management/ClassManagement";

const CreateClassPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem("teacherId");
  
  if (!schoolId || !teacherId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Invalid school or missing teacher information.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="teacher" 
        userName={localStorage.getItem("teacherUsername") || "Teacher"} 
      />
      
      <div className="container mx-auto py-8 px-4">
        <ClassManagement 
          onBack={() => navigate("/teacher-dashboard")}
          schoolId={schoolId}
          teacherId={teacherId}
          directCreateMode={true}
        />
      </div>
    </div>
  );
};

export default CreateClassPage;
