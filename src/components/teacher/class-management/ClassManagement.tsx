
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useClassManagement } from "./useClassManagement";
import SchoolInfoCard from "./SchoolInfoCard";
import ClassList from "./ClassList";
import AddStudentsDialog from "./AddStudentsDialog";
import DeleteClassDialog from "./DeleteClassDialog";
import { SelectSchoolDialog } from "./SelectSchoolDialog";
import { toast } from "@/hooks/use-toast";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
  directCreateMode?: boolean;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ 
  onBack, 
  schoolId, 
  teacherId,
  directCreateMode = false
}) => {
  const { t } = useTranslation();
  const [isSelectSchoolOpen, setIsSelectSchoolOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const { 
    classes,
    loading,
    isAdmin,
    successMessage,
    isAddStudentDialogOpen,
    availableStudents,
    isDeleteDialogOpen,
    classToDelete,
    setSuccessMessage,
    openAddStudentDialog,
    handleAddStudents,
    openDeleteDialog,
    handleDeleteClass,
    setIsAddStudentDialogOpen,
    setIsDeleteDialogOpen,
    refreshClasses,
  } = useClassManagement({ schoolId, teacherId, directCreateMode });
  
  // Add effect to refresh classes when component mounts or when refreshTrigger changes
  React.useEffect(() => {
    console.log("Refreshing classes due to trigger or mount");
    refreshClasses();
  }, [refreshTrigger, schoolId]);
  
  // Function to manually refresh classes
  const handleRefresh = () => {
    toast({
      title: t("refreshing"),
      description: t("refreshing-class-list")
    });
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle class creation success with proper refresh
  const handleClassCreated = () => {
    console.log("Class created, refreshing classes");
    // Immediately refresh classes
    refreshClasses();
    // Add a small delay and refresh again to ensure we get the latest data
    setTimeout(() => {
      refreshClasses();
      // Add one more refresh after a longer delay to catch any delayed updates
      setTimeout(() => {
        refreshClasses();
      }, 2000);
    }, 1000);
    toast({
      title: t("success"),
      description: t("class-created-successfully")
    });
  };

  // Properly handle opening the add student dialog
  const handleOpenAddStudentDialog = (classId: string) => {
    setSelectedClassId(classId);
    openAddStudentDialog(classId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="h-9 w-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{directCreateMode ? t("manage-classes") : t("class-management")}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* School Info Card */}
        <SchoolInfoCard
          schoolId={schoolId}
          teacherId={teacherId}
          isAdmin={isAdmin}
        />
        
        {/* Add button to create class in any school */}
        <div className="mt-2 mb-4">
          <Button 
            variant="default" 
            onClick={() => setIsSelectSchoolOpen(true)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-md"
          >
            {t("create-class-in-any-school")}
          </Button>
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-green-500 mr-2">✓</div>
                <p>{successMessage}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSuccessMessage(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Classes List */}
      <h3 className="text-xl font-semibold mt-8 flex items-center justify-between">
        {t("your-classes")}
        <span className="text-sm text-gray-500">{classes.length} {t("classes-found")}</span>
      </h3>
      
      <ClassList 
        schoolId={schoolId}
        teacherId={teacherId}
        onRefresh={handleRefresh}
      />
      
      {/* Add Student Dialog */}
      <AddStudentsDialog
        isOpen={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
        classId={selectedClassId || ""}
        onStudentsAdded={handleAddStudents}
      />
      
      {/* Delete Class Confirmation Dialog */}
      <DeleteClassDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteClass}
        classId={classToDelete || undefined}
      />
      
      {/* School Selection Dialog */}
      <SelectSchoolDialog
        open={isSelectSchoolOpen}
        onOpenChange={setIsSelectSchoolOpen}
        teacherId={teacherId}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
};

export default ClassManagement;
