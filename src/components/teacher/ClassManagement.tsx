import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Users, Trash, FileText, Coins, Download, Check, X, UserPlus, Gamepad2, UserMinus, Heart, MessageSquare, UserPlus as RequestAccess } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import CreateHomeworkDialog from "./CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import { awardCoinsToStudent } from "@/utils/pokemon";
import ClassFeed from "./ClassFeed";
import ClassComments from "./ClassComments";

// Import our new synchronization functions
import { 
  createClass, 
  deleteClass, 
  fetchTeacherClasses, 
  fetchSchoolClasses,
  addStudentToClass,
  removeStudentFromClass,
  toggleClassLike,
  subscribeToClassChanges
} from "@/utils/classSync";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
}

interface ClassData {
  id: string;
  name: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  isPublic?: boolean;
  createdAt?: string;
  likes?: string[];
  description?: string;
}

interface StudentData {
  id: string;
  displayName: string;
  coins?: number;
  submissions?: HomeworkSubmission[];
}

const ClassManagement: React.FC<ClassManagementProps> = ({
  onBack,
  schoolId,
  teacherId
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Class state
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [viewMode, setViewMode] = useState<"manage" | "social">("manage");
  const [isLoading, setIsLoading] = useState(false);

  // Student state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("students");
  const [isGiveCoinsOpen, setIsGiveCoinsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Manage Pokemon dialog state
  const [isManagePokemonOpen, setIsManagePokemonOpen] = useState(false);

  // Add student to class state
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const [searchStudentResults, setSearchStudentResults] = useState<any[]>([]);

  // Confirm remove student dialog state
  const [isConfirmRemoveStudentOpen, setIsConfirmRemoveStudentOpen] = useState(false);

  // Homework state
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);

  // Load data
  useEffect(() => {
    loadClassesData();
    
    // Subscribe to class changes for real-time updates
    const unsubscribe = subscribeToClassChanges(() => {
      console.log("Received class update notification");
      loadClassesData();
    }, teacherId);
    
    return () => {
      unsubscribe();
    };
  }, [schoolId, teacherId]);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsData();
      loadHomeworkData();
    }
  }, [selectedClass]);

  const loadClassesData = async () => {
    setIsLoading(true);
    try {
      // Fetch classes from database
      const teacherClasses = await fetchTeacherClasses(teacherId);
      setClasses(teacherClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        title: t("error"),
        description: t("error-loading-classes"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllClasses = async () => {
    try {
      // Fetch all classes for the school
      return await fetchSchoolClasses(schoolId);
    } catch (error) {
      console.error("Error loading all classes:", error);
      toast({
        title: t("error"),
        description: t("error-loading-classes"),
        variant: "destructive"
      });
      return [];
    }
  };

  const loadStudentsData = () => {
    if (!selectedClass) return;

    // Get all students
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");

    // Filter students that are in this class
    const classStudents = allStudents.filter((student: any) => selectedClass.students && selectedClass.students.includes(student.id));

    // Get student data with coins
    const studentsWithData = classStudents.map((student: any) => {
      // Get student coins
      const studentCollection = JSON.parse(localStorage.getItem(`pokemon-collection-${student.id}`) || '{"coins": 0}');
      return {
        id: student.id,
        displayName: student.displayName,
        coins: studentCollection.coins || 0
      };
    });
    setStudents(studentsWithData);
  };

  const loadHomeworkData = () => {
    if (!selectedClass) return;

    // Get homework for this class
    const allHomework = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    const classHomework = allHomework.filter((hw: HomeworkAssignment) => hw.classId === selectedClass.id && hw.teacherId === teacherId);
    setHomeworkAssignments(classHomework);

    // Get homework submissions
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    const classSubmissions = allSubmissions.filter((sub: HomeworkSubmission) => classHomework.some((hw: HomeworkAssignment) => hw.id === sub.homeworkId));
    setHomeworkSubmissions(classSubmissions);
  };

  const handleCreateClass = async () => {
    if (!newClassName) {
      toast({
        title: t("error"),
        description: t("enter-class-name"),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create new class using our sync function
      const newClassData = await createClass({
        name: newClassName,
        description: newClassDescription,
        teacherId,
        schoolId,
        students: [],
        isPublic: isPublic,
        createdAt: new Date().toISOString(),
        likes: []
      });

      // Update state with the new class
      setClasses([...classes, newClassData]);
      setNewClassName("");
      setNewClassDescription("");
      setIsPublic(true);
      setIsCreateClassDialogOpen(false);
      
      toast({
        title: t("success"),
        description: t("class-created")
      });
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: t("error"),
        description: t("error-creating-class"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    setIsLoading(true);
    try {
      // Delete class using our sync function
      const success = await deleteClass(classId);
      
      if (success) {
        // Update state
        setClasses(classes.filter(cls => cls.id !== classId));
        
        // If the selected class is deleted, deselect it
        if (selectedClass && selectedClass.id === classId) {
          setSelectedClass(null);
        }
        
        toast({
          title: t("success"),
          description: t("class-deleted")
        });
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: t("error-deleting-class"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classData: ClassData) => {
    setSelectedClass(classData);
    setSelectedTab("students"); // Default to students tab
    setViewMode(classData.teacherId === teacherId ? "manage" : "social");
  };

  const handleToggleLike = async (classId: string) => {
    setIsLoading(true);
    try {
      // Toggle like using our sync function
      const updatedClass = await toggleClassLike(classId, teacherId);
      
      if (updatedClass) {
        // Update the selected class if it's the one we modified
        if (selectedClass && selectedClass.id === classId) {
          setSelectedClass(updatedClass);
        }
        
        // Update the class in our classes array
        setClasses(prevClasses => prevClasses.map(cls => 
          cls.id === classId ? updatedClass : cls
        ));
        
        const hasLiked = updatedClass.likes?.includes(teacherId);
        toast({
          title: t("success"),
          description: hasLiked ? t("class-liked") : t("class-unliked")
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: t("error"),
        description: t("error-updating-like"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = (classId: string) => {
    const existingRequests = JSON.parse(localStorage.getItem("accessRequests") || "[]");
    
    // Check if request already exists
    const hasRequested = existingRequests.some(
      (req: any) => req.classId === classId && req.requesterId === teacherId
    );
    
    if (hasRequested) {
      toast({
        title: t("info"),
        description: t("access-already-requested")
      });
      return;
    }
    
    // Add new request
    const newRequest = {
      id: `request-${Date.now()}`,
      classId,
      requesterId: teacherId,
      ownerTeacherId: selectedClass?.teacherId || "",
      status: "pending",
      requestedAt: new Date().toISOString()
    };
    
    const updatedRequests = [...existingRequests, newRequest];
    localStorage.setItem("accessRequests", JSON.stringify(updatedRequests));
    
    toast({
      title: t("success"),
      description: t("access-requested")
    });
  };

  const handleAwardCoins = (studentId: string, studentName: string) => {
    setSelectedStudent({
      id: studentId,
      name: studentName
    });
    setIsGiveCoinsOpen(true);
  };

  const handleGiveCoins = (amount: number) => {
    if (!selectedStudent) return;

    // Award coins to student
    awardCoinsToStudent(selectedStudent.id, amount);

    // Refresh student data
    loadStudentsData();

    // Close dialog and reset selected student
    setIsGiveCoinsOpen(false);
    setSelectedStudent(null);
    toast({
      title: t("coins-awarded"),
      description: `${amount} ${t("coins-awarded-to")} ${selectedStudent.name}`
    });
  };

  const handleManagePokemon = (studentId: string, studentName: string) => {
    setSelectedStudent({
      id: studentId,
      name: studentName
    });
    setIsManagePokemonOpen(true);
  };

  const handlePokemonRemoved = () => {
    // Refresh student data when a Pokemon is removed
    loadStudentsData();
  };

  const handleHomeworkCreated = (homework: HomeworkAssignment) => {
    setHomeworkAssignments([...homeworkAssignments, homework]);
  };

  const handleApproveSubmission = (submission: HomeworkSubmission) => {
    // Find the homework to get the reward amount
    const homework = homeworkAssignments.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;

    // Update submission status
    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === submission.id) {
        return {
          ...sub,
          status: "approved" as const
        };
      }
      return sub;
    });

    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    setHomeworkSubmissions(updatedSubmissions);

    // Award coins to student
    awardCoinsToStudent(submission.studentId, homework.coinReward);

    // Refresh student data
    loadStudentsData();
    toast({
      title: t("success"),
      description: `${t("submission-approved")} ${homework.coinReward} ${t("coins-awarded")}`
    });
  };

  const handleRejectSubmission = (submission: HomeworkSubmission) => {
    // Update submission status
    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === submission.id) {
        return {
          ...sub,
          status: "rejected" as const
        };
      }
      return sub;
    });

    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    setHomeworkSubmissions(updatedSubmissions);
    toast({
      title: t("submission-rejected"),
      description: t("no-coins-awarded")
    });
  };

  const handleDeleteHomework = (homeworkId: string) => {
    // Remove homework assignment
    const filteredAssignments = homeworkAssignments.filter(hw => hw.id !== homeworkId);
    localStorage.setItem("homeworkAssignments", JSON.stringify(filteredAssignments));

    // Remove associated submissions
    const filteredSubmissions = homeworkSubmissions.filter(sub => sub.homeworkId !== homeworkId);
    localStorage.setItem("homeworkSubmissions", JSON.stringify(filteredSubmissions));

    // Update state
    setHomeworkAssignments(filteredAssignments);
    setHomeworkSubmissions(filteredSubmissions);
    toast({
      title: t("homework-deleted"),
      description: t("homework-submissions-deleted")
    });
  };

  const navigateToStudentProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  // Search students for adding to class
  const handleSearchStudents = () => {
    if (!searchStudentTerm.trim()) {
      setSearchStudentResults([]);
      return;
    }
    
    setIsLoading(true);
    const term = searchStudentTerm.toLowerCase();
    
    // Use Supabase to search for students
    const searchStudents = async () => {
      try {
        const { data: studentsData, error } = await supabase
          .from('students')
          .select('*')
          .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`);
        
        if (error) {
          console.error("Error searching students:", error);
          throw error;
        }
        
        // Filter out students who are already in the class
        const filteredStudents = studentsData.filter(student => 
          !selectedClass?.students?.includes(student.id)
        );
        
        setSearchStudentResults(filteredStudents);
      } catch (error) {
        console.error("Error in student search:", error);
        
        // Fallback to localStorage if database query fails
        const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
        const filteredStudents = allStudents.filter((student: any) => {
          const isAlreadyInClass = selectedClass?.students?.includes(student.id);
          const matchesTerm = student.username?.toLowerCase().includes(term) || 
                             student.displayName?.toLowerCase().includes(term);
          return !isAlreadyInClass && matchesTerm;
        });
        
        setSearchStudentResults(filteredStudents);
      } finally {
        setIsLoading(false);
      }
    };
    
    searchStudents();
  };

  // Add student to class
  const handleAddStudentToClass = async (studentId: string) => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      // Add student using our sync function
      const success = await addStudentToClass(selectedClass.id, studentId);
      
      if (success) {
        // Update the selected class with the new student
        const updatedClass = {
          ...selectedClass,
          students: [...(selectedClass.students || []), studentId]
        };
        
        setSelectedClass(updatedClass);
        
        // Update the class in our classes array
        setClasses(prevClasses => prevClasses.map(cls => 
          cls.id === selectedClass.id ? updatedClass : cls
        ));
        
        // Refresh student data
        loadStudentsData();
        
        toast({
          title: t("success"),
          description: t("student-added-to-class")
        });
        
        // Clear search
        setSearchStudentTerm("");
        setSearchStudentResults([]);
        setIsAddStudentDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding student to class:", error);
      toast({
        title: t("error"),
        description: t("error-adding-student"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle removing a student from class
  const handleRemoveStudentFromClass = (studentId: string, studentName: string) => {
    setSelectedStudent({
      id: studentId,
      name: studentName
    });
    setIsConfirmRemoveStudentOpen(true);
  };

  // Function to confirm removing the student from class
  const confirmRemoveStudent = async () => {
    if (!selectedStudent || !selectedClass) return;
    
    setIsLoading(true);
    try {
      // Remove student using our sync function
      const success = await removeStudentFromClass(selectedClass.id, selectedStudent.id);
      
      if (success) {
        // Update the selected class by removing the student
        const updatedClass = {
          ...selectedClass,
          students: (selectedClass.students || []).filter(id => id !== selectedStudent.id)
        };
        
        setSelectedClass(updatedClass);
        
        // Update the class in our classes array
        setClasses(prevClasses => prevClasses.map(cls => 
          cls.id === selectedClass.id ? updatedClass : cls
        ));
        
        // Refresh student data
        loadStudentsData();
        
        toast({
          title: t("success"),
          description: `${selectedStudent.name} ${t("removed-from-class")}`
        });
      }
    } catch (error) {
      console.error("Error removing student from class:", error);
      toast({
        title: t("error"),
        description: t("error-removing-student"),
        variant: "destructive"
      });
    } finally {
      // Close dialog and reset selected student
      setIsConfirmRemoveStudentOpen(false);
      setSelectedStudent(null);
      setIsLoading(false);
    }
  };

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);

  // Get submissions for a specific homework
  const getSubmissionsForHomework = (homeworkId: string) => {
    return homeworkSubmissions.filter(sub => sub.homeworkId === homeworkId);
  };

  // Get icon for homework type
  const getHomeworkTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      case "audio":
        return <MicIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Create Icon components for types from lucide-react
  const ImageIcon = ({
    className
  }: {
    className?: string;
  }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
  const MicIcon = ({
    className
  }: {
    className?: string;
  }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold flex-1">
          {selectedClass ? selectedClass.name : t("class-management")}
        </h2>
        
        {!selectedClass && <Button onClick={() => setIsCreateClassDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {t("create-class")}
        </Button>}
        
        {selectedClass && viewMode === "manage" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(true)} className="mr-2">
              <UserPlus className="h-4 w-4 mr-1" />
              {t("add-student")}
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteClass(selectedClass.id)}>
              <Trash className="h-4 w-4 mr-1" />
              {t("delete-class")}
            </Button>
          </div>
        )}
        
        {selectedClass && viewMode === "social" && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleToggleLike(selectedClass.id)}
              className={`${(selectedClass.likes || []).includes(teacherId) ? "bg-pink-50" : ""}`}
            >
              <Heart 
                className={`h-4 w-4 mr-1 ${(selectedClass.likes || []).includes(teacherId) ? "fill-pink-500 text-pink-500" : ""}`} 
              />
              {(selectedClass.likes || []).length} {t("likes")}
            </Button>
            <Button variant="outline" onClick={() => handleRequestAccess(selectedClass.id)}>
              <RequestAccess className="h-4 w-4 mr-1" />
              {t("request-control-access")}
            </Button>
          </div>
        )}
      </div>
      
      {!selectedClass ? (
        <Tabs defaultValue="my-classes">
          <TabsList className="mb-6">
            <TabsTrigger value="my-classes">{t("my-classes")}</TabsTrigger>
            <TabsTrigger value="all-classes">{t("all-classes")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-classes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length > 0 ? classes.map(classData => (
                <Card key={classData.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleClassSelect(classData)}>
                  <CardHeader>
                    <CardTitle>{classData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-5 w-5 mr-2" />
                      <span>
                        {classData.students ? classData.students.length : 0} {t("students")}
                      </span>
                    </div>
                    {classData.description && (
                      <p className="text-sm text-gray-600 mt-2">{classData.description}</p>
                    )}
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">{t("no-classes")}</p>
                  <Button onClick={() => setIsCreateClassDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("create-class")}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all-classes">
            <ClassFeed 
              schoolId={schoolId} 
              teacherId={teacherId} 
              onClassSelect={handleClassSelect} 
            />
          </TabsContent>
        </Tabs>
      ) : (
        viewMode === "manage" ? (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="students">{t("students")}</TabsTrigger>
              <TabsTrigger value="homework">{t("homework")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>{t("students-in-class")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("name")}</TableHead>
                          
                          <TableHead className="text-right">{t("actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => <TableRow key={student.id}>
                            <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => navigateToStudentProfile(student.id)}>
                              {student.displayName}
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="text-amber-500" onClick={() => handleAwardCoins(student.id, student.displayName)}>
                                  <Coins className="h-4 w-4 mr-1" />
                                  {t("award-coins")}
                                </Button>
                                <Button variant="outline" size="sm" className="text-blue-500" onClick={() => handleManagePokemon(student.id, student.displayName)}>
                                  <Gamepad2 className="h-4 w-4 mr-1" />
                                  {t("manage-pokemon")}
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleRemoveStudentFromClass(student.id, student.displayName)}>
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  {t("remove-student")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table> : <div className="text-center py-6">
                      <p className="text-gray-500">{t("no-students-in-class")}</p>
                      <Button onClick={() => setIsAddStudentDialogOpen(true)} className="mt-4">
                        <UserPlus className="h-4 w-4 mr-1" />
                        {t("add-student")}
                      </Button>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="homework">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold">{t("class-homework")}</h3>
                <Button onClick={() => setIsCreateHomeworkOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("create-homework")}
                </Button>
              </div>
              
              {activeHomework.length === 0 ? <Card>
                  <CardContent className="pt-6 text-center">
                    <p>{t("no-active-homework")}</p>
                    <Button onClick={() => setIsCreateHomeworkOpen(true)} className="mt-4">
                      {t("create-homework")}
                    </Button>
                  </CardContent>
                </Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeHomework.map(homework => {
            const submissions = getSubmissionsForHomework(homework.id);
            return <Card key={homework.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getHomeworkTypeIcon(homework.type)}
                            <CardTitle className="ml-2">{homework.title}</CardTitle>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(homework.createdAt).toLocaleDateString()} - {t("expires-in")} {Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60))} {t("hours")}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{homework.description}</p>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium mb-2">{t("submissions")}: {submissions.length}</p>
                          {submissions.length > 0 ? <div className="space-y-2 max-h-64 overflow-auto">
                              {submissions.map(submission => <div key={submission.id} className="bg-white p-2 rounded border flex justify-between items-center">
                                  <div>
                                    <p className="font-medium cursor-pointer hover:underline" onClick={() => navigateToStudentProfile(submission.studentId)}>
                                      {submission.studentName}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</p>
                                  </div>
                                  {submission.status === "pending" ? <div className="flex space-x-1">
                                      <Button size="sm" variant="outline" onClick={() => window.open(submission.content, '_blank')}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-amber-500" onClick={() => handleAwardCoins(submission.studentId, submission.studentName)}>
                                        <Coins className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleRejectSubmission(submission)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-green-500" onClick={() => handleApproveSubmission(submission)}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div> : <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {submission.status === 'approved' ? t("approved") : t("rejected")}
                                      </span>
                                      <Button size="sm" variant="outline" className="text-amber-500" onClick={() => handleAwardCoins(submission.studentId, submission.studentName)}>
                                        <Coins className="h-4 w-4" />
                                      </Button>
                                    </div>}
                                </div>)}
                            </div> : <p className="text-sm text-gray-500">{t("no-submissions-yet")}</p>}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{t("reward")}:</span> {homework.coinReward} {t("coins")}
                        </div>
                        <Button variant="outline" className="text-red-500" onClick={() => handleDeleteHomework(homework.id)}>
                          {t("delete")}
                        </Button>
                      </CardFooter>
                    </Card>;
          })}
              </div>}
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedClass.name}</CardTitle>
                    {selectedClass.createdAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(selectedClass.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {selectedClass.students?.length || 0} {t("students")}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(selectedClass.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${(selectedClass.likes || []).includes(teacherId) ? "fill-pink-500 text-pink-500" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedClass.description ? (
                  <p className="text-gray-600">{selectedClass.description}</p>
                ) : (
                  <p className="text-gray-500 italic">{t("no-description")}</p>
                )}
              </CardContent>
            </Card>
            
            <ClassComments classId={selectedClass.id} teacherId={teacherId} />
          </div>
        )
      )}
      
      {/* Create Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create-class")}</DialogTitle>
            <DialogDescription>
              {t("create-class-desc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="className">{t("class-name")}</Label>
              <Input id="className" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder={t("enter-class-name")} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classDescription">{t("class-description")}</Label>
              <Input id="classDescription" value={newClassDescription} onChange={e => setNewClassDescription(e.target.value)} placeholder={t("enter-class-description")} />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isPublic" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isPublic">{t("make-class-public")}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateClassDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateClass}>
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Student to Class Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("add-student-to-class")}</DialogTitle>
            <DialogDescription>
              {t("search-student-by-name")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex gap-2">
              <Input placeholder={t("search-student")} value={searchStudentTerm} onChange={e => setSearchStudentTerm(e.target.value)} onKeyDown={e => {
              if (e.key === "Enter") {
                handleSearchStudents();
              }
            }} />
              <Button onClick={handleSearchStudents}>{t("search")}</Button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {searchStudentResults.length > 0 ? <div className="space-y-2">
                  {searchStudentResults.map(student => <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{student.displayName || student.username}</p>
                        <p className="text-xs text-gray-500">@{student.username}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAddStudentToClass(student.id)}>
                        {t("add")}
                      </Button>
                    </div>)}
                </div> : searchStudentTerm ? <p className="text-center py-4 text-gray-500">{t("no-students-found")}</p> : <p className="text-center py-4 text-gray-500">{t("search-to-find-students")}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Homework Dialog */}
      {selectedClass && <CreateHomeworkDialog open={isCreateHomeworkOpen} onOpenChange={setIsCreateHomeworkOpen} onHomeworkCreated={handleHomeworkCreated} teacherId={teacherId} classId={selectedClass.id} className={selectedClass.name} />}
      
      {/* Give Coins Dialog */}
      <GiveCoinsDialog open={isGiveCoinsOpen} onOpenChange={setIsGiveCoinsOpen} onGiveCoins={handleGiveCoins} />
      
      {/* Manage Pokemon Dialog */}
      {selectedStudent && <ManagePokemonDialog open={isManagePokemonOpen} onOpenChange={setIsManagePokemonOpen} studentId={selectedStudent.id} studentName={selectedStudent.name} schoolId={schoolId} onPokemonRemoved={handlePokemonRemoved} />}
      
      {/* Confirm Remove Student Dialog */}
      <Dialog open={isConfirmRemoveStudentOpen} onOpenChange={setIsConfirmRemoveStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Student from Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from this class? 
              This won't delete the student account, but they will no longer have access to this class.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRemoveStudentOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveStudent}>
              Remove Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
