
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
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeworkData = async () => {
    if (!teacherId) return;
    
    try {
      console.log("Loading homework data for teacher:", teacherId);
      setIsLoading(true);
      
      // Load homework assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
        
      if (assignmentsError) {
        console.error("Error loading homework assignments:", assignmentsError);
        throw assignmentsError;
      }
      
      console.log("Loaded homework assignments:", assignments);
      
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
      
      setHomeworkAssignments(mappedAssignments);
      
      // Load ALL submissions for this teacher's homework assignments
      if (mappedAssignments.length > 0) {
        const homeworkIds = mappedAssignments.map(hw => hw.id);
        
        const { data: submissions, error: submissionsError } = await supabase
          .from('homework_submissions')
          .select('*')
          .in('homework_id', homeworkIds)
          .order('submitted_at', { ascending: false });
          
        if (submissionsError) {
          console.error("Error loading submissions:", submissionsError);
          throw submissionsError;
        }
        
        console.log("Loaded submissions for teacher's homework:", submissions);
        
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
        
        console.log("Final mapped submissions:", mappedSubmissions);
        console.log("Pending submissions count:", mappedSubmissions.filter(s => s.status === 'pending').length);
        setHomeworkSubmissions(mappedSubmissions);
      } else {
        console.log("No homework assignments found, clearing submissions");
        setHomeworkSubmissions([]);
      }
      
    } catch (error) {
      console.error("Error loading homework data:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-homework"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadClassesData = async () => {
    if (!teacherId) return;
    
    try {
      console.log("Loading classes for teacher:", teacherId);
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);
        
      if (error) {
        console.error("Error loading classes:", error);
        throw error;
      }
      
      console.log("Loaded classes:", data);
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

  // Initial data load
  useEffect(() => {
    if (teacherId) {
      loadHomeworkData();
      loadClassesData();
    }
  }, [teacherId]);

  // Setup realtime subscription for immediate updates
  useEffect(() => {
    if (!teacherId) return;

    console.log("Setting up realtime subscriptions for teacher:", teacherId);
    
    // Realtime subscription for homework submissions
    const submissionsChannel = supabase
      .channel('homework-submissions-teacher')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'homework_submissions' 
        },
        (payload) => {
          console.log("Realtime submission change detected:", payload);
          // Reload data immediately when any submission changes
          loadHomeworkData();
        }
      )
      .subscribe();
      
    const homeworkChannel = supabase
      .channel('homework-teacher')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'homework',
          filter: `teacher_id=eq.${teacherId}`
        },
        (payload) => {
          console.log("Realtime homework change detected:", payload);
          loadHomeworkData();
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(homeworkChannel);
    };
  }, [teacherId]);

  return {
    homeworkAssignments,
    setHomeworkAssignments,
    homeworkSubmissions,
    setHomeworkSubmissions,
    classes,
    setClasses,
    loadHomeworkData,
    isLoading
  };
};
