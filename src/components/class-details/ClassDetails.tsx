import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Loader2, Trash2, Award, BookText, Coins, Settings, PlusCircle, Minus } from "lucide-react";
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
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/utils/pokemon/studentPokemon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsTab from "@/components/student/StudentsTab";
import CreateHomeworkDialog from "@/components/teacher/CreateHomeworkDialog";
import { HomeworkAssignment } from "@/types/homework";
import ManageClassDialog from "@/components/dialogs/ManageClassDialog";
import { StudentsList } from "@/components/student-profile/StudentsList";
import { motion } from "framer-motion";

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
  const [homeworkTab, setHomeworkTab] = useState<"active" | "submissions">("active");

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
          fetchStudentsFromSupabase(cls.students);
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
            {t("back-to-dashboard")}
          </Button>
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t("class-details")}
          </motion.h1>
        </div>
        
        <div className="flex gap-2">
          {isClassCreator() ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Button 
                  onClick={() => setIsCreateHomeworkOpen(true)}
                  className="mr-2"
                >
                  <BookText className="h-4 w-4 mr-1" />
                  {t("assign-homework")}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button 
                  onClick={() => setIsManageClassOpen(true)}
                  className="mr-2"
                  variant="secondary"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {t("manage-class")}
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
          ) : (
            <Button
              variant="outline"
              className="mr-2"
              disabled={true}
            >
              {t("view-only-mode")}
            </Button>
          )}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">{t("class-info")}</TabsTrigger>
          <TabsTrigger value="students">{t("students")}</TabsTrigger>
          <TabsTrigger value="homework">{t("homework")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="md:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
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
                  {(classData.teacher_id || classData.teacherId) && (
                    <div>
                      <h3 className="font-medium text-gray-500">{t("creator")}</h3>
                      <p>
                        {isClassCreator() ? 
                          t("you") : 
                          `${(classData.teacher_id || classData.teacherId).substring(0, 8)}...`
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("students")} ({students.length})</CardTitle>
                  {isClassCreator() && (
                    <Button 
                      variant="default" 
                      className="bg-sky-500 hover:bg-sky-600"
                      onClick={() => setIsStudentListOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      {t("add-students")}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                      {t("no-students-in-class")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student) => (
                        <motion.div 
                          key={student.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleStudentClick(student.id)}
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                              {(student.display_name || student.displayName || student.username || '??')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{student.display_name || student.displayName || student.username}</p>
                              <p className="text-sm text-gray-500">@{student.username}</p>
                              <p className="text-xs text-gray-400">
                                Password: {student.password_hash || student.password || "•••••••"}
                              </p>
                            </div>
                          </div>
                          
                          {isClassCreator() && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGiveCoinsDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username
                                  })
                                }}
                              >
                                <Coins className="h-4 w-4 mr-1" />
                                {t("award-coins")}
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  setRemoveCoinsDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username
                                  })
                                }}
                              >
                                <Minus className="h-4 w-4 mr-1" />
                                {t("remove-coins")}
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setManagePokemonDialog({
                                    open: true, 
                                    studentId: student.id,
                                    studentName: student.display_name || student.displayName || student.username,
                                    schoolId: classData.school_id || classData.schoolId
                                  })
                                }}
                              >
                                <Award className="h-4 w-4 mr-1" />
                                {t("manage-pokemon")}
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="students">
          {id && <StudentsTab classId={id} />}
        </TabsContent>

        <TabsContent value="homework">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("class-homework")}</CardTitle>
              {isClassCreator() && (
                <Button 
                  onClick={() => setIsCreateHomeworkOpen(true)}
                >
                  <BookText className="h-4 w-4 mr-1" />
                  {t("create-homework")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Tabs value={homeworkTab} onValueChange={(val) => setHomeworkTab(val as "active" | "submissions")} className="mt-2">
                <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
                  <TabsTrigger value="active">{t("active-homework")}</TabsTrigger>
                  <TabsTrigger value="submissions">{t("homework-submissions")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t("no-active-homework")}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="submissions">
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t("no-homework-submissions")}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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
          
          {/* Create Homework Dialog */}
          <CreateHomeworkDialog
            open={isCreateHomeworkOpen}
            onOpenChange={setIsCreateHomeworkOpen}
            onHomeworkCreated={handleHomeworkCreated}
            teacherId={teacherId}
            classId={id || ""}
            className={classData.name}
          />
          
          {/* Manage Class Dialog */}
          <ManageClassDialog
            open={isManageClassOpen}
            onOpenChange={setIsManageClassOpen}
            classId={id || ""}
            className={classData?.name || ""}
            students={students.map(student => ({
              id: student.id,
              displayName: student.display_name || student.displayName || student.username,
              username: student.username,
              schoolId: classData?.school_id || classData?.schoolId
            }))}
            teacherId={teacherId}
          />
        </>
      )}
    </div>
  );
};

export default ClassDetails;
