
import React from "react";
import { StudentsList } from "@/components/student-profile/StudentsList";
import DeleteClassDialog from "@/components/dialogs/DeleteClassDialog";
import RemoveStudentDialog from "@/components/dialogs/RemoveStudentDialog";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import RemoveCoinsDialog from "@/components/dialogs/RemoveCoinsDialog";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";

interface ClassDialogsProps {
  classId: string;
  isStudentListOpen: boolean;
  onStudentListOpenChange: (open: boolean) => void;
  onStudentsAdded: (studentIds: string[]) => void;
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onDeleteClass: () => void;
  removeStudentDialog: {
    open: boolean;
    studentId: string;
    studentName: string;
  };
  onRemoveStudentDialogChange: (dialog: any) => void;
  onRemoveStudent: (studentId: string) => void;
  isClassCreator: boolean;
  managePokemonDialog: {
    open: boolean;
    studentId: string;
    studentName: string;
    schoolId: string;
  };
  onManagePokemonDialogChange: (dialog: any) => void;
  onPokemonRemoved: () => void;
  giveCoinsDialog: {
    open: boolean;
    studentId: string;
    studentName: string;
  };
  onGiveCoinsDialogChange: (dialog: any) => void;
  onGiveCoins: (amount: number) => void;
  removeCoinsDialog: {
    open: boolean;
    studentId: string;
    studentName: string;
  };
  onRemoveCoinsDialogChange: (dialog: any) => void;
  onRemoveCoins: (amount: number) => void;
  schoolPoolDialogOpen: boolean;
  onSchoolPoolDialogChange: (open: boolean) => void;
  schoolId: string;
  studentId?: string;
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
  schoolPoolDialogOpen,
  onSchoolPoolDialogChange,
  schoolId,
  studentId
}) => {
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

      {/* Delete Class Dialog */}
      <DeleteClassDialog
        isOpen={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        onConfirm={onDeleteClass}
      />

      {/* Remove Student Dialog */}
      <RemoveStudentDialog
        isOpen={removeStudentDialog.open}
        onOpenChange={(open) => onRemoveStudentDialogChange({
          ...removeStudentDialog,
          open
        })}
        studentName={removeStudentDialog.studentName}
        onConfirm={() => onRemoveStudent(removeStudentDialog.studentId)}
      />

      {/* Manage Pokemon Dialog */}
      <ManagePokemonDialog
        isOpen={managePokemonDialog.open}
        onOpenChange={(open) => onManagePokemonDialogChange({
          ...managePokemonDialog,
          open
        })}
        studentId={managePokemonDialog.studentId}
        studentName={managePokemonDialog.studentName}
        schoolId={managePokemonDialog.schoolId}
        onPokemonRemoved={onPokemonRemoved}
      />

      {/* Give Coins Dialog */}
      <GiveCoinsDialog
        isOpen={giveCoinsDialog.open}
        onOpenChange={(open) => onGiveCoinsDialogChange({
          ...giveCoinsDialog,
          open
        })}
        studentName={giveCoinsDialog.studentName}
        studentId={giveCoinsDialog.studentId}
        onGiveCoins={onGiveCoins}
      />

      {/* Remove Coins Dialog */}
      <RemoveCoinsDialog
        isOpen={removeCoinsDialog.open}
        onOpenChange={(open) => onRemoveCoinsDialogChange({
          ...removeCoinsDialog,
          open
        })}
        studentName={removeCoinsDialog.studentName}
        studentId={removeCoinsDialog.studentId}
        onRemoveCoins={onRemoveCoins}
      />

      {/* School Pokemon Pool Dialog */}
      <SchoolPokemonPoolDialog
        isOpen={schoolPoolDialogOpen}
        onOpenChange={onSchoolPoolDialogChange}
        schoolId={schoolId}
      />
    </>
  );
};

export default ClassDialogs;
