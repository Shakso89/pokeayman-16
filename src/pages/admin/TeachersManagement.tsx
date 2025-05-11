
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import AdminTeacherList from "@/components/admin/AdminTeacherList";
import AddTeacherDialog from "@/components/admin/AddTeacherDialog";

const TeachersManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      setTeachers(allTeachers);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teachers"
      });
    }
  };

  const handleAddTeacher = () => {
    setIsAddingTeacher(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Teachers Management</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Teachers</CardTitle>
            <Button onClick={handleAddTeacher}>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </CardHeader>
          <CardContent>
            {teachers.length > 0 ? (
              <AdminTeacherList 
                teachers={teachers} 
                onTeacherUpdated={loadTeachers}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gray-50 rounded-full p-6 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">No teachers found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AddTeacherDialog
          isOpen={isAddingTeacher}
          onClose={() => setIsAddingTeacher(false)}
          onTeacherAdded={loadTeachers}
        />
      </div>
    </AdminLayout>
  );
};

export default TeachersManagement;
