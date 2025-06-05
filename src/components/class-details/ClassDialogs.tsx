
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StudentsList } from "@/components/student-profile/StudentsList";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import RemoveCoinsDialog from "@/components/dialogs/RemoveCoinsDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface ClassDialogsProps {
  classId: string;
  isStudentListOpen: boolean;
  onStudentListOpenChange: (open: boolean) => void;
  onStudentsAdded: (studentIds: string[]) => void;
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onDeleteClass: () => void;
  removeStudentDialog: { open: boolean; studentId: string; studentName: string };
  onRemoveStudentDialogChange: (dialog: { open: boolean; studentId: string; studentName: string }) => void;
  onRemoveStudent: (studentId: string) => void;
  isClassCreator: boolean;
  managePokemonDialog: { open: boolean; studentId: string; studentName: string; schoolId: string };
  onManagePokemonDialogChange: (dialog: { open: boolean; studentId: string; studentName: string; schoolId: string }) => void;
  onPokemonRemoved: () => void;
  giveCoinsDialog: { open: boolean; studentId: string; studentName: string };
  onGiveCoinsDialogChange: (dialog: { open: boolean; studentId: string; studentName: string }) => void;
  onGiveCoins: (amount: number) => void;
  removeCoinsDialog: { open: boolean; studentId: string; studentName: string };
  onRemoveCoinsDialogChange: (dialog: { open: boolean; studentId: string; studentName: string }) => void;
  onRemoveCoins: (amount: number) => void;
}

const ClassDialogs: React.FC<ClassDialogsProps> = ({
  classId,
  isStudentListOpen,
  onStudentListOpenChange,
  onStudentsAdded,
  deleteDialogOpen,
  onDeleteDialogOpenChange,
  onDeleteClass,
  removeStudentDialog,
  onRemoveStudentDialogChange,
  onRemoveStudent,
  isClassCreator,
  managePokemonDialog,
  onManagePokemonDialogChange,
  onPokemonRemoved,
  giveCoinsDialog,
  onGiveCoinsDialogChange,
  onGiveCoins,
  removeCoinsDialog,
  onRemoveCoinsDialogChange,
  onRemoveCoins,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Add Students Dialog */}
      <StudentsList
        classId={classId}
        open={isStudentListOpen}
        onOpenChange={onStudentListOpenChange}
        onStudentsAdded={onStudentsAdded}
        viewMode={false}
      />

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete-class")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete-class-confirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteClass} className="bg-red-600 hover:bg-red-700">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog 
        open={removeStudentDialog.open} 
        onOpenChange={(open) => onRemoveStudentDialogChange({...removeStudentDialog, open})}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("remove-student")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeStudentDialog.studentName} from this class?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onRemoveStudent(removeStudentDialog.studentId)} 
              className="bg-red-600 hover:bg-red-700"
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Only render these dialogs if the user is the class creator */}
      {isClassCreator && (
        <>
          {/* Manage Pokemon Dialog */}
          <ManagePokemonDialog
            open={managePokemonDialog.open}
            onOpenChange={(open) => onManagePokemonDialogChange({...managePokemonDialog, open})}
            studentId={managePokemonDialog.studentId}
            studentName={managePokemonDialog.studentName}
            schoolId={managePokemonDialog.schoolId}
            onPokemonRemoved={onPokemonRemoved}
          />
          
          {/* Give Coins Dialog */}
          <GiveCoinsDialog
            isOpen={giveCoinsDialog.open}
            onClose={() => onGiveCoinsDialogChange({...giveCoinsDialog, open: false})}
            studentId={giveCoinsDialog.studentId}
            studentName={giveCoinsDialog.studentName}
            onCoinsAwarded={() => onGiveCoins(0)}
          />
          
          {/* Remove Coins Dialog */}
          <RemoveCoinsDialog
            open={removeCoinsDialog.open}
            onOpenChange={(open) => onRemoveCoinsDialogChange({...removeCoinsDialog, open})}
            onRemoveCoins={onRemoveCoins}
            studentId={removeCoinsDialog.studentId}
            studentName={removeCoinsDialog.studentName}
          />
        </>
      )}
    </>
  );
};

export default ClassDialogs;
