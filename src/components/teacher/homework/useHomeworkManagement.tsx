import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { supabase } from "@/integrations/supabase/client";

export const useHomeworkManagement = (teacherId: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "review">("active");
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
      // Load homework assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework')
        .select('*')
        .eq('teacher_id', teacherId);
        
      if (assignmentsError) throw assignmentsError;
      
      // Load homework submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('*');
        
      if (submissionsError) throw submissionsError;
      
      // Map to our interface format
      const mappedAssignments = assignments?.map(hw => ({
        id: hw.id,
        title: hw.title,
        description: hw.description || '',
        type: hw.type as "text" | "image" | "audio" | "multiple_choice",
        classId: hw.class_id || '',
        teacherId: hw.teacher_id,
        createdAt: hw.created_at,
        expiresAt: hw.expires_at,
        coinReward: hw.coin_reward,
        questions: hw.questions ? JSON.parse(hw.questions) : undefined
      })) || [];
      
      const mappedSubmissions = submissions?.map(sub => ({
        id: sub.id,
        homeworkId: sub.homework_id,
        studentId: sub.student_id,
        studentName: sub.student_name,
        content: sub.content,
        type: sub.type as "text" | "image" | "audio" | "multiple_choice",
        submittedAt: sub.submitted_at,
        status: sub.status as "pending" | "approved" | "rejected",
        feedback: sub.feedback,
        answers: sub.answers ? JSON.parse(sub.answers) : undefined
      })) || [];
      
      setHomeworkAssignments(mappedAssignments);
      setHomeworkSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Error loading homework data:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-homework"),
        variant: "destructive"
      });
    }
  };
  
  const loadClassesData = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);
        
      if (error) throw error;
      
      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const teacherClasses = allClasses.filter((cls: any) => cls.teacherId === teacherId);
      const formattedClasses = teacherClasses.map((cls: any) => ({ id: cls.id, name: cls.name }));
      setClasses(formattedClasses);
    }
  };

  const handleHomeworkCreated = async (homework: HomeworkAssignment) => {
    try {
      const { error } = await supabase
        .from('homework')
        .insert([{
          id: homework.id,
          title: homework.title,
          description: homework.description,
          type: homework.type,
          class_id: homework.classId,
          teacher_id: homework.teacherId,
          created_at: homework.createdAt,
          expires_at: homework.expiresAt,
          coin_reward: homework.coinReward,
          questions: homework.questions ? JSON.stringify(homework.questions) : null
        }]);
        
      if (error) throw error;
      
      setHomeworkAssignments(prev => [...prev, homework]);
      
      toast({
        title: t("homework-created"),
        description: t("homework-created-successfully"),
      });
    } catch (error) {
      console.error("Error saving homework:", error);
      toast({
        title: t("error"),
        description: t("failed-to-create-homework"),
        variant: "destructive"
      });
    }
  };

  const handleGiveCoins = (amount: number) => {
    if (!selectedStudent) return;
    
    // Award coins to student (implement this function)
    // awardCoinsToStudent(selectedStudent.id, amount);
    
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
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);
        
      if (error) throw error;
      
      // Also delete associated submissions
      await supabase
        .from('homework_submissions')
        .delete()
        .eq('homework_id', homeworkId);
      
      setHomeworkAssignments(prev => prev.filter(hw => hw.id !== homeworkId));
      setHomeworkSubmissions(prev => prev.filter(sub => sub.homeworkId !== homeworkId));
      
      toast({
        title: t("homework-deleted"),
        description: t("homework-submissions-deleted"),
      });
    } catch (error) {
      console.error("Error deleting homework:", error);
      toast({
        title: t("error"),
        description: t("failed-to-delete-homework"),
        variant: "destructive"
      });
    }
  };
  
  const handleApproveSubmission = async (submission: HomeworkSubmission) => {
    const homework = homeworkAssignments.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      // Award coins to student (implement this function)
      // awardCoinsToStudent(submission.studentId, homework.coinReward);
      
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? { ...sub, status: "approved" as const } : sub)
      );
      
      toast({
        title: t("submission-approved"),
        description: `${homework.coinReward} ${t("coins-awarded-to")} ${submission.studentName}`,
      });
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: t("error"),
        description: t("failed-to-approve-submission"),
        variant: "destructive"
      });
    }
  };
  
  const handleRejectSubmission = async (submission: HomeworkSubmission, feedback?: string) => {
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'rejected',
          feedback: feedback || ''
        })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? { 
          ...sub, 
          status: "rejected" as const,
          feedback: feedback 
        } : sub)
      );
      
      toast({
        title: t("submission-rejected"),
        description: t("student-notified"),
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: t("error"),
        description: t("failed-to-reject-submission"),
        variant: "destructive"
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
