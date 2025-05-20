
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Loader2, Trash2, Award, BookText, Coins } from "lucide-react";
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
import { removeClass, getClassById } from "@/utils/classSync/classOperations";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/utils/pokemon/studentPokemon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsTab from "@/components/student/StudentsTab";
import CreateHomeworkDialog from "@/components/teacher/CreateHomeworkDialog";
import { HomeworkAssignment } from "@/types/homework";

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
  // Management dialogs state
  const [managePokemonDialog, setManagePokemonDialog] = useState({
    open: false,
    studentId: "",
    studentName: "",
    schoolId: ""
  });
  const [giveCoinsDialog, setGiveCoinsDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");

  // Check if user is admin or teacher
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
    setIsTeacher(true); // Assuming if they can access this page, they're a teacher
    
    // Get teacher ID from localStorage
    const teacherId = localStorage.getItem("teacherId") || "";
    setTeacherId(teacherId);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // Try to use the classSync utility function first
        const cls = await getClassById(id);
        if (cls) {
          setClassData(cls);
          
          // If class has students, fetch their details
          if (cls.students && cls.students.length > 0) {
            try {
              const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select('*')
                .in('id', cls.students);
                
              if (!studentsError && studentsData) {
                setStudents(studentsData);
              }
            } catch (err) {
              console.error("Error fetching students:", err);
              // Attempt localStorage fallback for students
              fetchStudentsFromLocalStorage(cls.students);
            }
          }
          return;
        }
        
        // If getClassById failed, attempt direct Supabase query
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (classError) throw classError;
        
        if (!classData) {
          // Check localStorage as fallback
          checkLocalStorageFallback();
          return;
        }
        
        setClassData(classData);
        
        // Fetch student details if class has students
        if (classData.students && classData.students.length > 0) {
          fetchStudentsFromSupabase(classData.students);
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast({
          title: t("error"),
          description: t("failed-to-load-class-details"),
          variant: "destructive"
        });
        checkLocalStorageFallback();
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [id, t]);

  const checkLocalStorageFallback = () => {
    // Check localStorage as fallback
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses && id) {
      const parsedClasses = JSON.parse(savedClasses);
      const foundClass = parsedClasses.find((cls: any) => cls.id === id);
      if (foundClass) {
        setClassData(foundClass);
        
        // Fetch student details if class has students
        if (foundClass.students && foundClass.students.length > 0) {
          fetchStudentsFromLocalStorage(foundClass.students);
        }
      } else {
        setClassData(null);
      }
    } else {
      setClassData(null);
    }
  };

  const fetchStudentsFromSupabase = async (studentIds: string[]) => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching students from Supabase:", error);
      fetchStudentsFromLocalStorage(studentIds);
    }
  };

  const fetchStudentsFromLocalStorage = (studentIds: string[]) => {
    try {
      const savedStudents = localStorage.getItem("students");
      if (savedStudents) {
        const parsedStudents = JSON.parse(savedStudents);
        const classStudents = parsedStudents.filter((student: any) => 
          studentIds.includes(student.id)
        );
        setStudents(classStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students from localStorage:", error);
      setStudents([]);
    }
  };

  const handleDeleteClass = async () => {
    if (!id) return;
    
    try {
      const success = await removeClass(id);
      
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

  // Handle giving coins to a student
  const handleGiveCoins = (amount: number) => {
    if (!giveCoinsDialog.studentId) return;
    
    try {
      awardCoinsToStudent(giveCoinsDialog.studentId, amount);
      
      toast({
        title: t("success"),
        description: `${amount} ${t("coins-awarded-to")} ${giveCoinsDialog.studentName}`
      });
      
      setGiveCoinsDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error giving coins:", error);
      toast({
        title: t("error"),
        description: t("failed-to-give-coins"),
        variant: "destructive"
      });
    }
  };

  // Handle homework creation
  const handleHomeworkCreated = (homework: HomeworkAssignment) => {
    toast({
      title: t("success"),
      description: t("homework-created-successfully")
    });
  };

  // Handle Pokemon management
  const handlePokemonRemoved = () => {
    toast({
      title: t("success"),
      description: t("pokemon-removed-successfully")
    });
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
        
        <div className="flex gap-2">
          {isTeacher && (
            <Button 
              onClick={() => setIsCreateHomeworkOpen(true)}
              className="mr-2"
            >
              <BookText className="h-4 w-4 mr-1" />
              {t("assign-homework")}
            </Button>
          )}
          
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">{t("class-info")}</TabsTrigger>
          <TabsTrigger value="students">{t("students")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
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
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                            {(student.display_name || student.displayName || student.username || '??')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{student.display_name || student.displayName || student.username}</p>
                            <p className="text-sm text-gray-500">@{student.username}</p>
                          </div>
                        </div>
                        
                        {isTeacher && (
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setGiveCoinsDialog({
                                open: true, 
                                studentId: student.id,
                                studentName: student.display_name || student.displayName || student.username
                              })}
                            >
                              <Coins className="h-4 w-4 mr-1" />
                              {t("award-coins")}
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setManagePokemonDialog({
                                open: true, 
                                studentId: student.id,
                                studentName: student.display_name || student.displayName || student.username,
                                schoolId: classData.school_id || classData.schoolId
                              })}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              {t("manage-pokemon")}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students">
          {id && <StudentsTab classId={id} />}
        </TabsContent>
      </Tabs>

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
      
      {/* Manage Pokemon Dialog */}
      <ManagePokemonDialog
        open={managePokemonDialog.open}
        onOpenChange={(open) => setManagePokemonDialog({...managePokemonDialog, open})}
        studentId={managePokemonDialog.studentId}
        studentName={managePokemonDialog.studentName}
        schoolId={managePokemonDialog.schoolId}
        onPokemonRemoved={handlePokemonRemoved}
      />
      
      {/* Give Coins Dialog */}
      <GiveCoinsDialog
        open={giveCoinsDialog.open}
        onOpenChange={(open) => setGiveCoinsDialog({...giveCoinsDialog, open})}
        onGiveCoins={handleGiveCoins}
      />
      
      {/* Create Homework Dialog */}
      <CreateHomeworkDialog
        open={isCreateHomeworkOpen}
        onOpenChange={setIsCreateHomeworkOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classId={id || ""}
        className={classData.name}
      />
    </div>
  );
};

export default ClassDetails;
