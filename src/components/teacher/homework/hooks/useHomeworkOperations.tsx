
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Homework } from "@/types/homework";
import { checkAndConsumeCredits } from "@/utils/creditsService";

export const useHomeworkOperations = () => {
  const handleHomeworkCreated = async (homework: Homework, setHomework: React.Dispatch<React.SetStateAction<Homework[]>>) => {
    try {
      // Check and consume 5 credits for posting homework
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) {
        toast({
          title: "Error",
          description: "Teacher ID not found",
          variant: "destructive"
        });
        return;
      }

      const canProceed = await checkAndConsumeCredits(teacherId, 5, "Posting homework");
      if (!canProceed) {
        return; // Credits check failed, don't create homework
      }

      setHomework(prev => [homework, ...prev]);
      
      toast({
        title: "Success",
        description: "Homework created successfully! 5 credits consumed.",
      });
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: "Failed to create homework",
        variant: "destructive"
      });
    }
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
        description: "Homework deleted successfully"
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

  return {
    handleHomeworkCreated,
    handleDeleteHomework
  };
};
