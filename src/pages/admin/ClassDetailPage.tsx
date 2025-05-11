
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import ClassManagement from "@/components/teacher/ClassManagement";

const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Class Management</h1>
        
        {classId && (
          <Card className="p-6">
            <ClassManagement
              teacherId="admin" 
            />
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ClassDetailPage;
