
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  classId?: string;
}

const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  classId
}) => {
  const { t } = useTranslation();
  
  const handleConfirmDelete = async () => {
    if (classId) {
      try {
        console.log("Deleting class from database:", classId);
        
        // First update all students in this class to remove their class_id
        const { error: studentsError } = await supabase
          .from('students')
          .update({ class_id: null })
          .eq('class_id', classId);
          
        if (studentsError) {
          console.error("Error updating students:", studentsError);
        }
        
        // Then delete all homework submissions for this class's homework
        const { data: classHomework, error: homeworkFetchError } = await supabase
          .from('homework')
          .select('id')
          .eq('class_id', classId);
          
        if (!homeworkFetchError && classHomework && classHomework.length > 0) {
          const homeworkIds = classHomework.map(hw => hw.id);
          
          const { error: submissionsError } = await supabase
            .from('homework_submissions')
            .delete()
            .in('homework_id', homeworkIds);
            
          if (submissionsError) {
            console.error("Error deleting homework submissions:", submissionsError);
          }
        }
        
        // Delete all homework for this class
        const { error: homeworkError } = await supabase
          .from('homework')
          .delete()
          .eq('class_id', classId);
          
        if (homeworkError) {
          console.error("Error deleting homework:", homeworkError);
        }
        
        // Finally delete the class itself
        const { error: classError } = await supabase
          .from('classes')
          .delete()
          .eq('id', classId);
          
        if (classError) {
          console.error("Error deleting class:", classError);
          toast({
            title: t("error"),
            description: t("failed-to-delete-class"),
            variant: "destructive"
          });
        } else {
          console.log("Class successfully deleted from database:", classId);
          toast({
            title: t("success"),
            description: t("class-deleted-successfully"),
          });
        }
      } catch (err) {
        console.error("Exception during class deletion:", err);
        toast({
          title: t("error"),
          description: t("failed-to-delete-class"),
          variant: "destructive"
        });
      }
    }
    
    // Call the parent's onConfirmDelete for any local state updates
    onConfirmDelete();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete-class")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete-class-confirmation")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClassDialog;
