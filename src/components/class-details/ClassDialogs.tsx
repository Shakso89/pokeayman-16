
import React from "react";
import AddStudentsDialog from "@/components/teacher/class-management/AddStudentsDialog";
import DeleteClassDialog from "@/components/teacher/class-management/DeleteClassDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import RemoveCoinsDialog from "@/components/dialogs/RemoveCoinsDialog";
import SchoolPoolDialog from "@/components/student/SchoolPoolDialog";
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
  schoolPoolDialogOpen?: boolean;
  onSchoolPoolDialogChange?: (open: boolean) => void;
  schoolId?: string;
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
  schoolPoolDialogOpen = false,
  onSchoolPoolDialogChange,
  schoolId = ""
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Add Students Dialog */}
      <AddStudentsDialog
        open={isStudentListOpen}
        onOpenChange={onStudentListOpenChange}
        onStudentsAdded={() => onStudentsAdded([])}
        classId={classId}
        className=""
      />

      {/* Delete Class Dialog */}
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        onConfirm={onDeleteClass}
        className=""
      />

      {/* Remove Student Dialog */}
      <AlertDialog 
        open={removeStudentDialog.open} 
        onOpenChange={(open) => onRemoveStudentDialogChange({ ...removeStudentDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("remove-student")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("remove-student-confirmation")} {removeStudentDialog.studentName}?
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

      {/* Manage Pokemon Dialog */}
      <ManagePokemonDialog
        isOpen={managePokemonDialog.open}
        onOpenChange={(open) => onManagePokemonDialogChange({ ...managePokemonDialog, open })}
        studentId={managePokemonDialog.studentId}
        studentName={managePokemonDialog.studentName}
        schoolId={managePokemonDialog.schoolId}
        onPokemonRemoved={onPokemonRemoved}
        isClassCreator={isClassCreator}
      />

      {/* Give Coins Dialog */}
      <GiveCoinsDialog
        isOpen={giveCoinsDialog.open}
        onOpenChange={(open) => onGiveCoinsDialogChange({ ...giveCoinsDialog, open })}
        studentName={giveCoinsDialog.studentName}
        onGiveCoins={onGiveCoins}
      />

      {/* Remove Coins Dialog */}
      <RemoveCoinsDialog
        isOpen={removeCoinsDialog.open}
        onOpenChange={(open) => onRemoveCoinsDialogChange({ ...removeCoinsDialog, open })}
        studentName={removeCoinsDialog.studentName}
        onRemoveCoins={onRemoveCoins}
      />

      {/* School Pool Dialog */}
      {schoolPoolDialogOpen && onSchoolPoolDialogChange && (
        <SchoolPoolDialog
          open={schoolPoolDialogOpen}
          onOpenChange={onSchoolPoolDialogChange}
          schoolId={schoolId}
          userType="teacher"
        />
      )}
    </>
  );
};

export default ClassDialogs;
