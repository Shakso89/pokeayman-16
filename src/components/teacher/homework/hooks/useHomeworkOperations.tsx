
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Homework } from "@/types/homework";
import { checkAndConsumeCreditsForHomeworkPost } from "@/utils/creditSystem";

export const useHomeworkOperations = () => {
  const handleHomeworkCreated = (
    homework: Homework,
    setHomework: React.Dispatch<React.SetStateAction<Homework[]>>
  ) => {
    setHomework(prev => [homework, ...prev]);
    toast({
      title: "Success",
      description: "Homework created successfully!"
    });
  };

  const handleDeleteHomework = async (
    homeworkId: string,
    setHomework: React.Dispatch<React.SetStateAction<Homework[]>>,
    setSubmissions: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);

      if (error) throw error;

      setHomework(prev => prev.filter(hw => hw.id !== homeworkId));
      setSubmissions(prev => prev.filter(sub => sub.homework_id !== homeworkId));
      
      toast({
        title: "Success",
        description: "Homework deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Error",
        description: "Failed to delete homework",
        variant: "destructive"
      });
    }
  };

  const handleCreateHomework = async (
    homeworkData: any,
    teacherId: string,
    setHomework: React.Dispatch<React.SetStateAction<Homework[]>>
  ) => {
    // Check and consume credits for homework posting
    const hasCredits = await checkAndConsumeCreditsForHomeworkPost(teacherId);
    
    if (!hasCredits) {
      return false; // Credit check failed, toast already shown
    }

    try {
      const { data, error } = await supabase
        .from('homework')
        .insert([{
          ...homeworkData,
          teacher_id: teacherId
        }])
        .select()
        .single();

      if (error) throw error;

      handleHomeworkCreated(data, setHomework);
      return true;
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: "Failed to create homework",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleHomeworkCreated,
    handleDeleteHomework,
    handleCreateHomework
  };
};
