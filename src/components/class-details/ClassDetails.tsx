
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { removeClass } from "@/utils/classSync/classOperations";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/utils/pokemon/studentPokemon";
import { HomeworkAssignment } from "@/types/homework";
import ClassHeader from "./ClassHeader";
import ClassTabs from "./ClassTabs";
import ClassDialogs from "./ClassDialogs";
import { useClassDetails } from "./hooks/useClassDetails";

const ClassDetails = () => {
  const navigate = useNavigate();
  const {
    id,
    classData,
    students,
    loading,
    isAdmin,
    teacherId,
    isClassCreator,
    fetchClassDetails,
    t
  } = useClassDetails();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeStudentDialog, setRemoveStudentDialog] = useState({ open: false, studentId: "", studentName: "" });
  const [activeTab, setActiveTab] = useState("students");
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  
  // Management dialogs state
  const [managePokemonDialog, setManagePokemonDialog] = useState({
    open: false,
    studentId: "",
    studentName: "",
    schoolId: ""
  });
  const [giveCoinsDialog, setGiveCoinsDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });
  const [removeCoinsDialog, setRemoveCoinsDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });

  const handleDeleteClass = async () => {
    if (!id) return;
    
    try {
      const success = await removeClass(id);
      
      if (success) {
        toast({
          title: t("success"),
          description: t("class-deleted-successfully")
        });
        navigate("/teacher-dashboard");
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-delete-class"),
        variant: "destructive"
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!id || !studentId) return;
    
    try {
      // Update class data to remove student
      const updatedStudents = classData.students.filter((sid: string) => sid !== studentId);
      
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: t("success"),
        description: t("student-removed-successfully")
      });
      
      // Refresh the class details
      fetchClassDetails();
      setRemoveStudentDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: t("error"),
        description: t("failed-to-remove-student"),
        variant: "destructive"
      });
    }
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (!id || !studentIds.length) return;
    
    try {
      const success = await addMultipleStudentsToClass(id, studentIds);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${studentIds.length} ${t("students-added-to-class")}`
        });
        
        fetchClassDetails();
      } else {
        throw new Error("Failed to add students to class");
      }
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
        variant: "destructive"
      });
    }
  };

  const handleGiveCoins = (amount: number) => {
    if (!giveCoinsDialog.studentId) return;
    
    try {
      awardCoinsToStudent(giveCoinsDialog.studentId, amount);
      
      toast({
        title: t("success"),
        description: `${amount} ${t("coins-awarded-to")} ${giveCoinsDialog.studentName}`
      });
      
      setGiveCoinsDialog({ open: false, studentId: "", studentName: "" });
      // Refresh students to show updated coin counts
      fetchClassDetails();
    } catch (error) {
      console.error("Error giving coins:", error);
      toast({
        title: t("error"),
        description: t("failed-to-give-coins"),
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoins = (amount: number) => {
    if (!removeCoinsDialog.studentId) return;
    
    try {
      const success = removeCoinsFromStudent(removeCoinsDialog.studentId, amount);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${amount} coins removed from ${removeCoinsDialog.studentName}`
        });
        // Refresh students to show updated coin counts
        fetchClassDetails();
      } else {
        toast({
          title: t("error"),
          description: "Student doesn't have enough coins",
          variant: "destructive"
        });
      }
      
      setRemoveCoinsDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error removing coins:", error);
      toast({
        title: t("error"),
        description: "Failed to remove coins",
        variant: "destructive"
      });
    }
  };

  const handlePokemonRemoved = () => {
    toast({
      title: t("success"),
      description: t("pokemon-removed-successfully")
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-4">{t("class-not-found")}</h2>
            <Button onClick={() => navigate("/teacher-dashboard")}>
              {t("return-to-dashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ClassHeader
        classData={classData}
        studentsCount={students.length}
        isClassCreator={isClassCreator()}
        isAdmin={isAdmin}
        onAddStudent={() => setIsStudentListOpen(true)}
        onDeleteClass={() => setDeleteDialogOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <ClassTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          students={students}
          isClassCreator={isClassCreator()}
          classData={classData}
          teacherId={teacherId}
          onAwardCoins={(studentId, studentName) => setGiveCoinsDialog({ open: true, studentId, studentName })}
          onManagePokemon={(studentId, studentName, schoolId) => setManagePokemonDialog({ open: true, studentId, studentName, schoolId })}
          onRemoveStudent={(studentId, studentName) => setRemoveStudentDialog({ open: true, studentId, studentName })}
          onAddStudent={() => setIsStudentListOpen(true)}
        />
      </div>

      <ClassDialogs
        classId={id || ""}
        isStudentListOpen={isStudentListOpen}
        onStudentListOpenChange={setIsStudentListOpen}
        onStudentsAdded={handleAddStudents}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogOpenChange={setDeleteDialogOpen}
        onDeleteClass={handleDeleteClass}
        removeStudentDialog={removeStudentDialog}
        onRemoveStudentDialogChange={setRemoveStudentDialog}
        onRemoveStudent={handleRemoveStudent}
        isClassCreator={isClassCreator()}
        managePokemonDialog={managePokemonDialog}
        onManagePokemonDialogChange={setManagePokemonDialog}
        onPokemonRemoved={handlePokemonRemoved}
        giveCoinsDialog={giveCoinsDialog}
        onGiveCoinsDialogChange={setGiveCoinsDialog}
        onGiveCoins={handleGiveCoins}
        removeCoinsDialog={removeCoinsDialog}
        onRemoveCoinsDialogChange={setRemoveCoinsDialog}
        onRemoveCoins={handleRemoveCoins}
      />
    </div>
  );
};

export default ClassDetails;
