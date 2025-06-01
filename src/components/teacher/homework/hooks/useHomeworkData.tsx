
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
      console.log("Loading homework data for teacher:", teacherId);
      
      // Load homework assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework')
        .select('*')
        .eq('teacher_id', teacherId);
        
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
      
      // Load ALL submissions for ANY homework (not just this teacher's)
      const { data: allSubmissions, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('*');
        
      if (submissionsError) {
        console.error("Error loading submissions:", submissionsError);
        throw submissionsError;
      }
      
      console.log("All submissions from database:", allSubmissions);
      
      // Filter submissions to only include those for this teacher's homework
      const relevantSubmissions = allSubmissions?.filter(sub => {
        const homework = mappedAssignments.find(hw => hw.id === sub.homework_id);
        return homework !== undefined;
      }) || [];
      
      console.log("Relevant submissions for teacher:", relevantSubmissions);
      
      const mappedSubmissions = relevantSubmissions.map(sub => ({
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
      
      console.log("Final mapped submissions:", mappedSubmissions);
      console.log("Pending submissions count:", mappedSubmissions.filter(s => s.status === 'pending').length);
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

  // Setup realtime subscription for immediate updates
  useEffect(() => {
    if (teacherId) {
      loadHomeworkData();
      loadClassesData();
      
      // More aggressive realtime subscription
      const submissionsChannel = supabase
        .channel('homework-submissions-realtime')
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
        .channel('homework-realtime')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework' 
          },
          (payload) => {
            console.log("Realtime homework change detected:", payload);
            // Only reload if it's this teacher's homework
            if (payload.new && typeof payload.new === 'object' && 'teacher_id' in payload.new && payload.new.teacher_id === teacherId) {
              loadHomeworkData();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(submissionsChannel);
        supabase.removeChannel(homeworkChannel);
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
