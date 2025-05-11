
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Class } from "@/types/pokemon";
import AdminClassList from "@/components/admin/AdminClassList";
import AddClassDialog from "@/components/admin/AddClassDialog";

const ClassesManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      setClasses(allClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes"
      });
    }
  };

  const handleAddClass = () => {
    setIsAddingClass(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Classes Management</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Classes</CardTitle>
            <Button onClick={handleAddClass}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <AdminClassList 
                classes={classes} 
                onClassUpdated={loadClasses}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gray-50 rounded-full p-6 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">No classes found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AddClassDialog
          isOpen={isAddingClass}
          onClose={() => setIsAddingClass(false)}
          onClassAdded={loadClasses}
        />
      </div>
    </AdminLayout>
  );
};

export default ClassesManagement;
