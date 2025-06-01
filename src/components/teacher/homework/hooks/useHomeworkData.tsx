
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { supabase } from "@/integrations/supabase/client";

export const useHomeworkData = (teacherId: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  const loadHomeworkData = async () => {
    try {
      // Load homework assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework')
        .select('*')
        .eq('teacher_id', teacherId);
        
      if (assignmentsError) throw assignmentsError;
      
      // Load homework submissions for all homework by this teacher
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
      
      // Filter submissions to only include those for this teacher's homework
      const teacherHomeworkIds = mappedAssignments.map(hw => hw.id);
      const filteredSubmissions = submissions?.filter(sub => 
        teacherHomeworkIds.includes(sub.homework_id)
      ) || [];
      
      const mappedSubmissions = filteredSubmissions.map(sub => ({
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
      }));
      
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

  // Setup realtime subscription
  useEffect(() => {
    if (teacherId) {
      loadHomeworkData();
      loadClassesData();
      
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
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework' 
          },
          (payload) => {
            // Only reload if it's this teacher's homework
            if (payload.new && typeof payload.new === 'object' && 'teacher_id' in payload.new && payload.new.teacher_id === teacherId) {
              loadHomeworkData();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [teacherId]);

  return {
    homeworkAssignments,
    setHomeworkAssignments,
    homeworkSubmissions,
    setHomeworkSubmissions,
    classes,
    setClasses,
    loadHomeworkData
  };
};
