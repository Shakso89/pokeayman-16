import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Loader2, Trash2, Award, BookText, Coins, Settings, PlusCircle, UserMinus } from "lucide-react";
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
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import RemoveCoinsDialog from "@/components/dialogs/RemoveCoinsDialog";
import { awardCoinsToStudent, removeCoinsFromStudent, getStudentPokemonCollection } from "@/utils/pokemon/studentPokemon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsTab from "@/components/student/StudentsTab";
import CreateHomeworkDialog from "@/components/teacher/CreateHomeworkDialog";
import { HomeworkAssignment } from "@/types/homework";
import ManageClassDialog from "@/components/dialogs/ManageClassDialog";
import { StudentsList } from "@/components/student-profile/StudentsList";
import { motion } from "framer-motion";
import HomeworkManagement from "@/components/teacher/HomeworkManagement";

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeStudentDialog, setRemoveStudentDialog] = useState({ open: false, studentId: "", studentName: "" });
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [isManageClassOpen, setIsManageClassOpen] = useState(false);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  
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
  const [removeCoinsDialog, setRemoveCoinsDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [userPermissionLevel, setUserPermissionLevel] = useState<"owner" | "teacher" | "viewer">("viewer");

  // Check if user is admin or teacher
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
    setIsTeacher(true);
    
    const teacherId = localStorage.getItem("teacherId") || "";
    setTeacherId(teacherId);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    fetchClassDetails();
  }, [id, t, isAdmin, teacherId]);

  const fetchClassDetails = async () => {
    setLoading(true);
    try {
      const cls = await getClassById(id || "");
      if (cls) {
        setClassData(cls);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (cls.teacherId === currentTeacherId) {
          setUserPermissionLevel("owner");
        } else if (isAdmin) {
          setUserPermissionLevel("owner");
        } else {
          setUserPermissionLevel("viewer");
        }
        
        if (cls.students && cls.students.length > 0) {
          await fetchStudentsWithCoins(cls.students);
        }
        setLoading(false);
        return;
      }
      
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (classError) throw classError;
      
      if (!classData) {
        checkLocalStorageFallback();
        return;
      }
      
      setClassData(classData);
      
      if (classData.students && classData.students.length > 0) {
        await fetchStudentsWithCoins(classData.students);
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

  const checkLocalStorageFallback = () => {
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses && id) {
      const parsedClasses = JSON.parse(savedClasses);
      const foundClass = parsedClasses.find((cls: any) => cls.id === id);
      if (foundClass) {
        setClassData(foundClass);
        
        const currentTeacherId = localStorage.getItem("teacherId") || "";
        if (foundClass.teacherId === currentTeacherId) {
          setUserPermissionLevel("owner");
        } else if (isAdmin) {
          setUserPermissionLevel("owner");
        } else {
          setUserPermissionLevel("viewer");
        }
        
        if (foundClass.students && foundClass.students.length > 0) {
          fetchStudentsWithCoins(foundClass.students);
        }
      } else {
        setClassData(null);
      }
    } else {
      setClassData(null);
    }
  };

  const fetchStudentsWithCoins = async (studentIds: string[]) => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      
      // Add coin information to each student
      const studentsWithCoins = (studentsData || []).map(student => {
        const pokemonCollection = getStudentPokemonCollection(student.id);
        return {
          ...student,
          coins: pokemonCollection?.coins || 0
        };
      });
      
      setStudents(studentsWithCoins);
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
        ).map((student: any) => {
          const pokemonCollection = getStudentPokemonCollection(student.id);
          return {
            ...student,
            coins: pokemonCollection?.coins || 0
          };
        });
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

  const handleRemoveStudent = async (studentId: string) => {
    if (!id || !studentId) return;
    
    try {
      // Update class data to remove student
      const updatedStudents = classData.students.filter((sid: string) => sid !== studentId);
      
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: t("success"),
        description: t("student-removed-successfully")
      });
      
      // Refresh the class details
      fetchClassDetails();
      setRemoveStudentDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: t("error"),
        description: t("failed-to-remove-student"),
        variant: "destructive"
      });
    }
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (!id || !studentIds.length) return;
    
    try {
      const success = await addMultipleStudentsToClass(id, studentIds);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${studentIds.length} ${t("students-added-to-class")}`
        });
        
        fetchClassDetails();
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

  const handleGiveCoins = (amount: number) => {
    if (!giveCoinsDialog.studentId) return;
    
    try {
      awardCoinsToStudent(giveCoinsDialog.studentId, amount);
      
      toast({
        title: t("success"),
        description: `${amount} ${t("coins-awarded-to")} ${giveCoinsDialog.studentName}`
      });
      
      setGiveCoinsDialog({ open: false, studentId: "", studentName: "" });
      // Refresh students to show updated coin counts
      fetchClassDetails();
    } catch (error) {
      console.error("Error giving coins:", error);
      toast({
        title: t("error"),
        description: t("failed-to-give-coins"),
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoins = (amount: number) => {
    if (!removeCoinsDialog.studentId) return;
    
    try {
      const success = removeCoinsFromStudent(removeCoinsDialog.studentId, amount);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${amount} coins removed from ${removeCoinsDialog.studentName}`
        });
        // Refresh students to show updated coin counts
        fetchClassDetails();
      } else {
        toast({
          title: t("error"),
          description: "Student doesn't have enough coins",
          variant: "destructive"
        });
      }
      
      setRemoveCoinsDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error removing coins:", error);
      toast({
        title: t("error"),
        description: "Failed to remove coins",
        variant: "destructive"
      });
    }
  };

  const handleHomeworkCreated = (homework: HomeworkAssignment) => {
    toast({
      title: t("success"),
      description: t("homework-created-successfully")
    });
    
    setIsCreateHomeworkOpen(false);
  };

  const handlePokemonRemoved = () => {
    toast({
      title: t("success"),
      description: t("pokemon-removed-successfully")
    });
  };

  const isClassCreator = () => {
    const currentTeacherId = localStorage.getItem("teacherId") || "";
    return (classData && 
      (classData.teacher_id === currentTeacherId || 
       classData.teacherId === currentTeacherId)
    ) || isAdmin;
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/teacher-dashboard")}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              back
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">
              {classData.name}
            </h1>
          </div>
          
          {isClassCreator() && (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setIsStudentListOpen(true)}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                add-student
              </Button>
              
              {isAdmin && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  delete-class
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
            >
              students
            </TabsTrigger>
            <TabsTrigger 
              value="homework"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
            >
              homework
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">students-in-class</h2>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">{t("no-students-in-class")}</p>
                  {isClassCreator() && (
                    <Button 
                      onClick={() => setIsStudentListOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      {t("add-students")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">name</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">coins</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="text-sm font-medium text-gray-900">
                              {student.display_name || student.displayName || student.username}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-900">{student.coins}</span>
                          </td>
                          <td className="py-4 px-6">
                            {isClassCreator() && (
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 text-xs"
                                  onClick={() => setGiveCoinsDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username
                                  })}
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  award-coins
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
                                  onClick={() => setManagePokemonDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username,
                                    schoolId: classData.school_id || classData.schoolId
                                  })}
                                >
                                  <Award className="h-3 w-3 mr-1" />
                                  Manage Pokémon
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
                                  onClick={() => setRemoveStudentDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username
                                  })}
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  Remove Student
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="homework" className="mt-6">
            {isClassCreator() ? (
              <HomeworkManagement 
                onBack={() => setActiveTab("students")}
                teacherId={teacherId}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">{t("view-only-mode")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Students Dialog */}
      <StudentsList
        classId={id || ""}
        open={isStudentListOpen}
        onOpenChange={setIsStudentListOpen}
        onStudentsAdded={handleAddStudents}
        viewMode={false}
      />

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

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={removeStudentDialog.open} onOpenChange={(open) => setRemoveStudentDialog({...removeStudentDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("remove-student")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeStudentDialog.studentName} from this class?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleRemoveStudent(removeStudentDialog.studentId)} 
              className="bg-red-600 hover:bg-red-700"
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Only render these dialogs if the user is the class creator */}
      {isClassCreator() && (
        <>
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
            studentId={giveCoinsDialog.studentId}
          />
          
          {/* Remove Coins Dialog */}
          <RemoveCoinsDialog
            open={removeCoinsDialog.open}
            onOpenChange={(open) => setRemoveCoinsDialog({...removeCoinsDialog, open})}
            onRemoveCoins={handleRemoveCoins}
            studentId={removeCoinsDialog.studentId}
            studentName={removeCoinsDialog.studentName}
          />
        </>
      )}
    </div>
  );
};

export default ClassDetails;
