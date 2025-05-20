
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { supabase } from "@/integrations/supabase/client";
import { awardCoinsToStudent } from "@/utils/pokemon";

export const useHomeworkManagement = (teacherId: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
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
      
      // Setup realtime subscription
      const channel = supabase
        .channel('homework-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework_submissions' 
          },
          () => {
            loadHomeworkData();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [teacherId]);

  const loadHomeworkData = async () => {
    try {
      // First try to load from Supabase
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework')
        .select('*')
        .eq('teacherId', teacherId);
        
      if (assignmentsError) throw assignmentsError;
      
      const { data: submissions, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('*');
        
      if (submissionsError) throw submissionsError;
      
      setHomeworkAssignments(assignments || []);
      setHomeworkSubmissions(submissions || []);
    } catch (error) {
      console.error("Error loading from Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const assignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
      setHomeworkAssignments(assignments.filter((hw: HomeworkAssignment) => hw.teacherId === teacherId));
      
      const submissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
      setHomeworkSubmissions(submissions);
    }
  };
  
  const loadClassesData = async () => {
    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);
        
      if (error) throw error;
      
      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes from Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const teacherClasses = allClasses.filter((cls: any) => cls.teacherId === teacherId);
      const formattedClasses = teacherClasses.map((cls: any) => ({ id: cls.id, name: cls.name }));
      setClasses(formattedClasses);
    }
  };

  const handleHomeworkCreated = async (homework: HomeworkAssignment) => {
    try {
      // First try to save to Supabase
      const { error } = await supabase
        .from('homework')
        .insert([homework]);
        
      if (error) throw error;
      
      setHomeworkAssignments(prev => [...prev, homework]);
      
      toast({
        title: t("homework-created"),
        description: t("homework-created-successfully"),
      });
    } catch (error) {
      console.error("Error saving to Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const currentHomework = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
      localStorage.setItem("homeworkAssignments", JSON.stringify([...currentHomework, homework]));
      setHomeworkAssignments(prev => [...prev, homework]);
      
      toast({
        title: t("homework-created"),
        description: t("homework-created-successfully"),
      });
    }
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

  const handleDeleteHomework = async (homeworkId: string) => {
    try {
      // First try to delete from Supabase
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);
        
      if (error) throw error;
      
      // Also delete associated submissions
      await supabase
        .from('homework_submissions')
        .delete()
        .eq('homeworkId', homeworkId);
      
      // Update state
      setHomeworkAssignments(prev => prev.filter(hw => hw.id !== homeworkId));
      setHomeworkSubmissions(prev => prev.filter(sub => sub.homeworkId !== homeworkId));
      
      toast({
        title: t("homework-deleted"),
        description: t("homework-submissions-deleted"),
      });
    } catch (error) {
      console.error("Error deleting from Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const filteredAssignments = homeworkAssignments.filter(hw => hw.id !== homeworkId);
      localStorage.setItem("homeworkAssignments", JSON.stringify(filteredAssignments));
      
      const filteredSubmissions = homeworkSubmissions.filter(sub => sub.homeworkId !== homeworkId);
      localStorage.setItem("homeworkSubmissions", JSON.stringify(filteredSubmissions));
      
      // Update state
      setHomeworkAssignments(filteredAssignments);
      setHomeworkSubmissions(filteredSubmissions);
      
      toast({
        title: t("homework-deleted"),
        description: t("homework-submissions-deleted"),
      });
    }
  };
  
  const handleApproveSubmission = async (submission: HomeworkSubmission) => {
    // Find the associated homework to get coin reward
    const homework = homeworkAssignments.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    // Update submission status
    const updatedSubmission = { ...submission, status: "approved" as const };
    
    try {
      // First try to update in Supabase
      const { error } = await supabase
        .from('homework_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      // Award coins to student
      awardCoinsToStudent(submission.studentId, homework.coinReward);
      
      // Update state
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? updatedSubmission : sub)
      );
      
      toast({
        title: t("submission-approved"),
        description: `${homework.coinReward} ${t("coins-awarded-to")} ${submission.studentName}`,
      });
    } catch (error) {
      console.error("Error updating in Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const updatedSubmissions = homeworkSubmissions.map(sub => 
        sub.id === submission.id ? updatedSubmission : sub
      );
      localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
      
      // Award coins to student
      awardCoinsToStudent(submission.studentId, homework.coinReward);
      
      // Update state
      setHomeworkSubmissions(updatedSubmissions);
      
      toast({
        title: t("submission-approved"),
        description: `${homework.coinReward} ${t("coins-awarded-to")} ${submission.studentName}`,
      });
    }
  };
  
  const handleRejectSubmission = async (submission: HomeworkSubmission) => {
    // Update submission status
    const updatedSubmission = { ...submission, status: "rejected" as const };
    
    try {
      // First try to update in Supabase
      const { error } = await supabase
        .from('homework_submissions')
        .update({ status: 'rejected' })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      // Update state
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? updatedSubmission : sub)
      );
      
      toast({
        title: t("submission-rejected"),
        description: t("student-notified"),
      });
    } catch (error) {
      console.error("Error updating in Supabase, falling back to localStorage:", error);
      // Fallback to localStorage
      const updatedSubmissions = homeworkSubmissions.map(sub => 
        sub.id === submission.id ? updatedSubmission : sub
      );
      localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
      
      // Update state
      setHomeworkSubmissions(updatedSubmissions);
      
      toast({
        title: t("submission-rejected"),
        description: t("student-notified"),
      });
    }
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
    handleApproveSubmission,
    handleRejectSubmission,
    activeHomework,
    archivedHomework
  };
};
