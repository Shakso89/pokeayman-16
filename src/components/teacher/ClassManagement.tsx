
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Users, Trash, FileText, Coins, Download, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import CreateHomeworkDialog from "./CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import { awardCoinsToStudent } from "@/utils/pokemon";

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
}

interface StudentData {
  id: string;
  displayName: string;
  coins?: number;
  submissions?: HomeworkSubmission[];
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, schoolId, teacherId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Class state
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  
  // Student state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("students");
  const [isGiveCoinsOpen, setIsGiveCoinsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{id: string, name: string} | null>(null);
  
  // Homework state
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  
  // Load data
  useEffect(() => {
    loadClassesData();
  }, [schoolId, teacherId]);
  
  useEffect(() => {
    if (selectedClass) {
      loadStudentsData();
      loadHomeworkData();
    }
  }, [selectedClass]);
  
  const loadClassesData = () => {
    // Get classes from localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    // Filter classes that belong to this school and teacher
    const filteredClasses = allClasses.filter(
      (cls: any) => cls.schoolId === schoolId && cls.teacherId === teacherId
    );
    
    setClasses(filteredClasses);
  };
  
  const loadStudentsData = () => {
    if (!selectedClass) return;
    
    // Get all students
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Filter students that are in this class
    const classStudents = allStudents.filter((student: any) => 
      selectedClass.students && selectedClass.students.includes(student.id)
    );
    
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
    const classHomework = allHomework.filter((hw: HomeworkAssignment) => 
      hw.classId === selectedClass.id && hw.teacherId === teacherId
    );
    
    setHomeworkAssignments(classHomework);
    
    // Get homework submissions
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    const classSubmissions = allSubmissions.filter((sub: HomeworkSubmission) => 
      classHomework.some((hw: HomeworkAssignment) => hw.id === sub.homeworkId)
    );
    
    setHomeworkSubmissions(classSubmissions);
  };
  
  const handleCreateClass = () => {
    if (!newClassName) {
      toast({
        title: t("error"),
        description: t("enter-class-name"),
        variant: "destructive"
      });
      return;
    }
    
    // Create new class object
    const newClass = {
      id: `class-${Date.now()}`,
      name: newClassName,
      teacherId,
      schoolId,
      students: []
    };
    
    // Update localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = [...existingClasses, newClass];
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Update state
    setClasses([...classes, newClass]);
    setNewClassName("");
    setIsCreateClassDialogOpen(false);
    
    toast({
      title: t("success"),
      description: t("class-created")
    });
  };
  
  const handleDeleteClass = (classId: string) => {
    // Remove class from localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = existingClasses.filter((cls: any) => cls.id !== classId);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
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
  };
  
  const handleClassSelect = (classData: ClassData) => {
    setSelectedClass(classData);
    setSelectedTab("students"); // Default to students tab
  };
  
  const handleAwardCoins = (studentId: string, studentName: string) => {
    setSelectedStudent({id: studentId, name: studentName});
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
      description: `${amount} ${t("coins-awarded-to")} ${selectedStudent.name}`,
    });
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
        return { ...sub, status: "approved" as const };
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
      description: `${t("submission-approved")} ${homework.coinReward} ${t("coins-awarded")}`,
    });
  };

  const handleRejectSubmission = (submission: HomeworkSubmission) => {
    // Update submission status
    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === submission.id) {
        return { ...sub, status: "rejected" as const };
      }
      return sub;
    });
    
    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    setHomeworkSubmissions(updatedSubmissions);
    
    toast({
      title: t("submission-rejected"),
      description: t("no-coins-awarded"),
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
      description: t("homework-submissions-deleted"),
    });
  };

  const navigateToStudentProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
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
      case "text": return <FileText className="h-5 w-5 text-blue-500" />;
      case "image": return <Image className="h-5 w-5 text-green-500" />;
      case "audio": return <Mic className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };
  
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
        
        {!selectedClass && (
          <Button onClick={() => setIsCreateClassDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("create-class")}
          </Button>
        )}
        
        {selectedClass && (
          <Button variant="destructive" onClick={() => handleDeleteClass(selectedClass.id)}>
            <Trash className="h-4 w-4 mr-1" />
            {t("delete-class")}
          </Button>
        )}
      </div>
      
      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? (
            classes.map(classData => (
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
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">{t("no-classes")}</p>
              <Button onClick={() => setIsCreateClassDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t("create-class")}
              </Button>
            </div>
          )}
        </div>
      ) : (
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
                {students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("coins")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium cursor-pointer hover:underline" 
                                     onClick={() => navigateToStudentProfile(student.id)}>
                            {student.displayName}
                          </TableCell>
                          <TableCell>{student.coins}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-amber-500"
                              onClick={() => handleAwardCoins(student.id, student.displayName)}
                            >
                              <Coins className="h-4 w-4 mr-1" />
                              {t("award-coins")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">{t("no-students-in-class")}</p>
                  </div>
                )}
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
            
            {activeHomework.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p>{t("no-active-homework")}</p>
                  <Button onClick={() => setIsCreateHomeworkOpen(true)} className="mt-4">
                    {t("create-homework")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeHomework.map(homework => {
                  const submissions = getSubmissionsForHomework(homework.id);
                  return (
                    <Card key={homework.id} className="overflow-hidden">
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
                          {submissions.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-auto">
                              {submissions.map(submission => (
                                <div key={submission.id} className="bg-white p-2 rounded border flex justify-between items-center">
                                  <div>
                                    <p className="font-medium cursor-pointer hover:underline" 
                                       onClick={() => navigateToStudentProfile(submission.studentId)}>
                                      {submission.studentName}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</p>
                                  </div>
                                  {submission.status === "pending" ? (
                                    <div className="flex space-x-1">
                                      <Button size="sm" variant="outline" onClick={() => window.open(submission.content, '_blank')}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-amber-500"
                                        onClick={() => handleAwardCoins(submission.studentId, submission.studentName)}
                                      >
                                        <Coins className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleRejectSubmission(submission)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-green-500" onClick={() => handleApproveSubmission(submission)}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {submission.status === 'approved' ? t("approved") : t("rejected")}
                                      </span>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-amber-500"
                                        onClick={() => handleAwardCoins(submission.studentId, submission.studentName)}
                                      >
                                        <Coins className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">{t("no-submissions-yet")}</p>
                          )}
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
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder={t("enter-class-name")}
              />
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
      
      {/* Create Homework Dialog */}
      {selectedClass && (
        <CreateHomeworkDialog
          open={isCreateHomeworkOpen}
          onOpenChange={setIsCreateHomeworkOpen}
          onHomeworkCreated={handleHomeworkCreated}
          teacherId={teacherId}
          classId={selectedClass.id}
          className={selectedClass.name}
        />
      )}
      
      {/* Give Coins Dialog */}
      <GiveCoinsDialog
        open={isGiveCoinsOpen}
        onOpenChange={setIsGiveCoinsOpen}
        onGiveCoins={handleGiveCoins}
      />
    </div>
  );
};

export default ClassManagement;
