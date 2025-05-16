
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteClass } from "@/utils/pokemon/classManagement";

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (classError) throw classError;
        
        if (!classData) {
          // Check localStorage as fallback
          const savedClasses = localStorage.getItem("classes");
          if (savedClasses) {
            const parsedClasses = JSON.parse(savedClasses);
            const foundClass = parsedClasses.find((cls: any) => cls.id === id);
            if (foundClass) {
              setClassData(foundClass);
              
              // Fetch student details if class has students
              if (foundClass.students && foundClass.students.length > 0) {
                // Try to fetch from Supabase first
                const { data: studentsData, error: studentsError } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', foundClass.students);
                  
                if (!studentsError && studentsData) {
                  setStudents(studentsData);
                } else {
                  // Fallback to localStorage for students
                  const savedStudents = localStorage.getItem("students");
                  if (savedStudents) {
                    const parsedStudents = JSON.parse(savedStudents);
                    const classStudents = parsedStudents.filter((student: any) => 
                      foundClass.students.includes(student.id)
                    );
                    setStudents(classStudents);
                  }
                }
              }
              return;
            }
          }
          // If we get here, class was not found in database or localStorage
          console.error("Class not found in database or localStorage");
          setClassData(null);
          return;
        }
        
        setClassData(classData);
        
        // Fetch student details if class has students
        if (classData.students && classData.students.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .in('id', classData.students);
            
          if (studentsError) throw studentsError;
          setStudents(studentsData || []);
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast({
          title: t("error"),
          description: t("failed-to-load-class-details"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [id, t]);

  const handleDeleteClass = async () => {
    if (!id) return;
    
    try {
      const success = await deleteClass(id);
      
      if (success) {
        toast({
          title: t("success"),
          description: t("class-deleted-successfully")
        });
        navigate("/teacher-dashboard");
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-delete-class"),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-4">{t("class-not-found")}</h2>
            <Button onClick={() => navigate("/teacher-dashboard")}>
              {t("return-to-dashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/teacher-dashboard")}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back-to-dashboard")}
          </Button>
          <h1 className="text-2xl font-bold">{t("class-details")}</h1>
        </div>
        
        {isAdmin && (
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t("delete-class")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("class-information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">{t("name")}</h3>
              <p className="text-lg">{classData.name}</p>
            </div>
            {classData.description && (
              <div>
                <h3 className="font-medium text-gray-500">{t("description")}</h3>
                <p>{classData.description}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-500">{t("created")}</h3>
              <p>{new Date(classData.created_at || classData.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Students List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("students")} ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                {t("no-students-in-class")}
              </p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                      {(student.display_name || student.displayName || student.username || '??')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{student.display_name || student.displayName || student.username}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete-class")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete-class-confirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassDetails;
