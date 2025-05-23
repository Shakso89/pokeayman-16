
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, User, School, Calendar, Box, Loader2, Users, RefreshCw } from "lucide-react";
import { getClassById } from "@/utils/classSync/classOperations";
import { ClassData } from "@/utils/classSync/types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { StudentsList } from "@/components/student-profile/StudentsList";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";

const ClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId, refreshTrigger, t]);
  
  const loadClassDetails = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      const data = await getClassById(classId);
      console.log("Loaded class data:", data);
      
      if (data) {
        setClassData(data);
        
        // Load student details if we have student IDs
        if (data.students && data.students.length > 0) {
          fetchStudentDetails(data.students);
        } else {
          setStudents([]);
        }
      } else {
        toast({
          title: t("error"),
          description: t("class-not-found"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading class details:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-class-details"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentDetails = async (studentIds: string[]) => {
    if (!studentIds.length) return;
    
    setLoadingStudents(true);
    try {
      // Try local storage first as fallback
      const localStudents = JSON.parse(localStorage.getItem("students") || "[]");
      let matchingStudents = localStudents.filter(
        (s: any) => studentIds.includes(s.id)
      );
      
      try {
        // Now try to get from Supabase
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .in('id', studentIds);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("Fetched student details from Supabase:", data);
          setStudents(data);
        } else {
          console.log("Fetched student details from localStorage:", matchingStudents);
          setStudents(matchingStudents);
        }
      } catch (error) {
        console.error("Error fetching student details from Supabase:", error);
        console.log("Fetched student details from localStorage:", matchingStudents);
        setStudents(matchingStudents);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const handleRefresh = () => {
    toast({
      title: t("refreshing"),
      description: t("refreshing-class-data")
    });
    setRefreshTrigger(prev => prev + 1);
  };
  
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin" || username === "Ayman";
  const teacherId = localStorage.getItem("teacherId");
  const isTeacherOrAdmin = isAdmin || (classData?.teacherId === teacherId);

  // Handle adding students to the class
  const handleAddStudents = async (studentIds: string[]) => {
    if (!classId || studentIds.length === 0) return;
    
    try {
      console.log("Adding students to class:", studentIds);
      const success = await addMultipleStudentsToClass(classId, studentIds);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${studentIds.length} ${t("students-added-to-class")}`
        });
        
        // Refresh class details to show new students
        handleRefresh();
      } else {
        throw new Error("Failed to add students to class");
      }
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <NavBar userType="teacher" userName="Teacher" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-4 bg-white hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("class-details")}</h1>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            className="ml-auto h-9 w-9 bg-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4">Loading class details...</p>
          </div>
        ) : classData ? (
          <div className="space-y-6">
            <Card className="bg-white shadow-md border-t-4 border-t-pokemon-red">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{classData.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classData.description && (
                    <p className="text-gray-600 italic">{classData.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <School className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">
                        <strong>{t("school-id")}:</strong> {classData.schoolId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-sm">
                        <strong>{t("teacher")}:</strong> {classData.teacherId ? classData.teacherId.substring(0, 8) + '...' : t("admin-created")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="text-sm">
                        <strong>{t("created")}:</strong> {new Date(classData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Box className="h-5 w-5 mr-2 text-yellow-500" />
                      <span className="text-sm">
                        <strong>{t("students")}:</strong> {classData.students?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Students Section */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      {t("students")}
                    </div>
                    {isTeacherOrAdmin && (
                      <Button 
                        className="bg-pokemon-red hover:bg-red-600 text-white"
                        onClick={() => setIsStudentDialogOpen(true)}
                      >
                        {t("add-students")}
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : students.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {students.map(student => (
                      <div 
                        key={student.id}
                        className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                            {(student.display_name || student.username || '')
                              .substring(0, 1)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{student.display_name || student.username}</p>
                            <p className="text-xs text-gray-500">@{student.username}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-6">
                      {t("no-students-yet")}
                    </p>
                    {isTeacherOrAdmin && (
                      <Button 
                        className="bg-pokemon-red hover:bg-red-600 text-white"
                        onClick={() => setIsStudentDialogOpen(true)}
                      >
                        {t("add-students")}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{t("class-not-found")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Selection Dialog */}
      {classId && (
        <StudentsList
          classId={classId}
          open={isStudentDialogOpen}
          onOpenChange={setIsStudentDialogOpen}
          onStudentsAdded={handleAddStudents}
        />
      )}
    </div>
  );
};

export default ClassDetailsPage;
