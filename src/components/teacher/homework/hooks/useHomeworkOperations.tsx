
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { supabase } from "@/integrations/supabase/client";

export const useHomeworkOperations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleHomeworkCreated = async (
    homework: HomeworkAssignment, 
    setHomeworkAssignments: React.Dispatch<React.SetStateAction<HomeworkAssignment[]>>
  ) => {
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

  const handleDeleteHomework = async (
    homeworkId: string,
    setHomeworkAssignments: React.Dispatch<React.SetStateAction<HomeworkAssignment[]>>,
    setHomeworkSubmissions: React.Dispatch<React.SetStateAction<HomeworkSubmission[]>>
  ) => {
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

  return {
    handleHomeworkCreated,
    handleDeleteHomework
  };
};
