
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
    <div className="container mx-auto py-8 px-4">
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/teacher-dashboard")}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {classData.name}
          </motion.h1>
        </div>
        
        <div className="flex gap-2">
          {isClassCreator() && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Button 
                  onClick={() => setIsStudentListOpen(true)}
                  className="mr-2"
                  variant="outline"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  {t("add-student")}
                </Button>
              </motion.div>
              
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("delete-class")}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="students">{t("students")}</TabsTrigger>
          <TabsTrigger value="homework">{t("homework")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t("students-in-class")} ({students.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">{t("no-students-in-class")}</p>
                  {isClassCreator() && (
                    <Button 
                      onClick={() => setIsStudentListOpen(true)}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      {t("add-students")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">{t("name")}</th>
                        <th className="text-left py-2 font-medium text-gray-600">{t("coins")}</th>
                        <th className="text-right py-2 font-medium text-gray-600">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3 text-sm">
                                {(student.display_name || student.displayName || student.username || '??')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{student.display_name || student.displayName || student.username}</p>
                                <p className="text-sm text-gray-500">@{student.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="font-medium">{student.coins}</span>
                          </td>
                          <td className="py-3">
                            {isClassCreator() && (
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
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
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
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
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => setRemoveStudentDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username
                                  })}
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  {t("remove-student")}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homework">
          {isClassCreator() ? (
            <HomeworkManagement 
              onBack={() => setActiveTab("students")}
              teacherId={teacherId}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">{t("view-only-mode")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
