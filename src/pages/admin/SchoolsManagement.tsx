
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import { useNavigate } from "react-router-dom";

const SchoolsManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  const handleSelectSchool = (schoolId: string) => {
    navigate(`/admin-dashboard/schools/${schoolId}`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <SchoolManagement 
          onBack={handleBack} 
          onSelectSchool={handleSelectSchool}
          teacherId="admin"
        />
      </div>
    </AdminLayout>
  );
};

export default SchoolsManagement;
