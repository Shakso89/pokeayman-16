
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
  classId?: string; // Add optional classId prop to directly delete from database
}

const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  classId
}) => {
  const { t } = useTranslation();
  
  // Enhanced delete handler to ensure database deletion
  const handleConfirmDelete = async () => {
    // First call the parent's onConfirmDelete for any local state updates
    onConfirmDelete();
    
    // If classId is provided, also ensure direct database deletion
    if (classId) {
      try {
        // Delete the class directly from the database
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', classId);
          
        if (error) {
          console.error("Error directly deleting class from database:", error);
          toast({
            title: t("warning"),
            description: t("class-may-not-be-fully-deleted"),
            variant: "destructive"
          });
        } else {
          console.log("Class successfully deleted from database:", classId);
        }
      } catch (err) {
        console.error("Exception during direct class deletion:", err);
      }
    }
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
