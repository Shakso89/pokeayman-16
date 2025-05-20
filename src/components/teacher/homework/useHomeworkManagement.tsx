
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
// Add this import 
import { awardCoinsToStudent } from "@/utils/pokemon";

export const useHomeworkManagement = (teacherId: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [isGiveCoinsOpen, setIsGiveCoinsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{id: string, name: string} | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  
  // Load data
  useEffect(() => {
    if (teacherId) {
      loadHomeworkData();
      loadClassesData();
    }
  }, [teacherId]);

  const loadHomeworkData = () => {
    // Load homework assignments
    const assignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    setHomeworkAssignments(assignments.filter((hw: HomeworkAssignment) => hw.teacherId === teacherId));
    
    // Load homework submissions
    const submissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    setHomeworkSubmissions(submissions);
  };
  
  const loadClassesData = () => {
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    // Filter for teacher's classes
    const teacherClasses = allClasses.filter((cls: any) => cls.teacherId === teacherId);
    setClasses(teacherClasses.map((cls: any) => ({ id: cls.id, name: cls.name })));
  };

  const handleHomeworkCreated = (homework: HomeworkAssignment) => {
    setHomeworkAssignments([...homeworkAssignments, homework]);
  };

  const handleGiveCoins = (amount: number) => {
    if (!selectedStudent) return;
    
    // Award coins to student
    awardCoinsToStudent(selectedStudent.id, amount);
    
    // Close dialog and reset selected student
    setIsGiveCoinsOpen(false);
    setSelectedStudent(null);
    
    toast({
      title: t("coins-awarded"),
      description: `${amount} ${t("coins-awarded-to")} ${selectedStudent.name}`,
    });
  };
  
  const handleCreateHomework = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setIsCreateHomeworkOpen(true);
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

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);
  const archivedHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) <= now);

  return {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    homeworkAssignments,
    setHomeworkAssignments,
    homeworkSubmissions,
    setHomeworkSubmissions,
    classes,
    setClasses,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    setSelectedStudent,
    selectedClassId,
    selectedClassName,
    setSelectedClassName,
    handleHomeworkCreated,
    handleGiveCoins,
    handleCreateHomework,
    handleDeleteHomework,
    activeHomework,
    archivedHomework
  };
};

