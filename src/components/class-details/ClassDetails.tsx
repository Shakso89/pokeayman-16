
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { deleteClass } from "@/utils/classSync/classOperations";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/utils/pokemon/studentPokemon";
import ClassManagementHeader from "./ClassManagementHeader";
import StudentsGrid from "./StudentsGrid";
import ClassTabs from "./ClassTabs";
import ClassDialogs from "./ClassDialogs";
import AddAssistantDialog from "@/components/dialogs/AddAssistantDialog";
import { useClassDetailsWithId } from "./hooks/useClassDetailsWithId";

interface ClassDetailsProps {
  classId?: string;
}

const ClassDetails: React.FC<ClassDetailsProps> = ({ classId }) => {
  const navigate = useNavigate();
  const {
    classData,
    students,
    loading,
    isAdmin,
    teacherId,
    isClassCreator,
    fetchClassDetails,
    t
  } = useClassDetailsWithId(classId);

  const [removeStudentDialog, setRemoveStudentDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });
  const [activeTab, setActiveTab] = useState("students");
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isAddAssistantOpen, setIsAddAssistantOpen] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [schoolPoolDialogOpen, setSchoolPoolDialogOpen] = useState(false);

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
    if (!classId) return;
    try {
      const success = await deleteClass(classId);
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
    if (!classId || !studentId) return;
    try {
      const updatedStudents = classData.students.filter((sid: string) => sid !== studentId);
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: t("success"),
        description: t("student-removed-successfully")
      });

      fetchClassDetails();
      setRemoveStudentDialog({
        open: false,
        studentId: "",
        studentName: ""
      });
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
    if (!classId || !studentIds.length) return;
    try {
      const success = await addMultipleStudentsToClass(classId, studentIds);
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
      setGiveCoinsDialog({
        open: false,
        studentId: "",
        studentName: ""
      });
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
        fetchClassDetails();
      } else {
        toast({
          title: t("error"),
          description: "Student doesn't have enough coins",
          variant: "destructive"
        });
      }
      setRemoveCoinsDialog({
        open: false,
        studentId: "",
        studentName: ""
      });
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

  const handleSwitchToHomework = () => {
    setActiveTab("homework");
  };

  const handleAssistantAdded = (assistantId: string) => {
    fetchClassDetails();
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
    <div className="min-h-screen bg-transparent">
      <ClassManagementHeader
        classData={classData}
        studentsCount={students.length}
        isClassCreator={isClassCreator()}
        onAddStudent={() => setIsStudentListOpen(true)}
        onSwitchToHomework={handleSwitchToHomework}
        pendingSubmissions={pendingSubmissions}
        onDeleteClass={handleDeleteClass}
        onViewSchoolPool={() => setSchoolPoolDialogOpen(true)}
        onAddAssistant={() => setIsAddAssistantOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "students" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Class Students</h2>
            </div>
            
            <StudentsGrid
              students={students}
              isClassCreator={isClassCreator()}
              onAwardCoins={(studentId, studentName) => setGiveCoinsDialog({
                open: true,
                studentId,
                studentName
              })}
              onManagePokemon={(studentId, studentName, schoolId) => setManagePokemonDialog({
                open: true,
                studentId,
                studentName,
                schoolId
              })}
              onRemoveStudent={(studentId, studentName) => setRemoveStudentDialog({
                open: true,
                studentId,
                studentName
              })}
              onRemoveCoins={(studentId, studentName) => setRemoveCoinsDialog({
                open: true,
                studentId,
                studentName
              })}
              onRemovePokemon={(studentId, studentName) => console.log("Remove pokemon:", studentName)}
              classData={classData}
            />
          </div>
        ) : (
          <ClassTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            students={students}
            isClassCreator={isClassCreator()}
            classData={classData}
            teacherId={teacherId}
            onAwardCoins={(studentId, studentName) => setGiveCoinsDialog({
              open: true,
              studentId,
              studentName
            })}
            onManagePokemon={(studentId, studentName, schoolId) => setManagePokemonDialog({
              open: true,
              studentId,
              studentName,
              schoolId
            })}
            onRemoveStudent={(studentId, studentName) => setRemoveStudentDialog({
              open: true,
              studentId,
              studentName
            })}
            onAddStudent={() => setIsStudentListOpen(true)}
          />
        )}
      </div>

      <ClassDialogs
        classId={classId || ""}
        isStudentListOpen={isStudentListOpen}
        onStudentListOpenChange={setIsStudentListOpen}
        onStudentsAdded={handleAddStudents}
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
        schoolPoolDialogOpen={schoolPoolDialogOpen}
        onSchoolPoolDialogChange={setSchoolPoolDialogOpen}
        schoolId={classData.schoolId || ""}
      />

      <AddAssistantDialog
        isOpen={isAddAssistantOpen}
        onOpenChange={setIsAddAssistantOpen}
        classId={classId || ""}
        currentAssistants={classData.assistants || []}
        onAssistantAdded={handleAssistantAdded}
      />
    </div>
  );
};

export default ClassDetails;
