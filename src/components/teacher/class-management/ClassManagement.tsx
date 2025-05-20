
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useClassManagement } from "./useClassManagement";
import ClassForm from "./ClassForm";
import SchoolInfoCard from "./SchoolInfoCard";
import ClassList from "./ClassList";
import AddStudentsDialog from "./AddStudentsDialog";
import DeleteClassDialog from "./DeleteClassDialog";

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
  
  const { 
    classes,
    loading,
    isAdmin,
    successMessage,
    justCreatedClass,
    isAddStudentDialogOpen,
    availableStudents,
    isDeleteDialogOpen,
    setSuccessMessage,
    handleClassCreated,
    openAddStudentDialog,
    handleAddStudents,
    openDeleteDialog,
    handleDeleteClass,
    setIsAddStudentDialogOpen,
    setIsDeleteDialogOpen,
  } = useClassManagement({ schoolId, teacherId, directCreateMode });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold">{directCreateMode ? t("create-class") : t("class-management")}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Class Card */}
        <ClassForm 
          schoolId={schoolId}
          teacherId={teacherId}
          isAdmin={isAdmin}
          onClassCreated={handleClassCreated}
          directCreateMode={directCreateMode}
        />
        
        {/* School Info Card */}
        <SchoolInfoCard
          schoolId={schoolId}
          teacherId={teacherId}
          isAdmin={isAdmin}
        />
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
      <h3 className="text-xl font-semibold mt-8">{t("your-classes")}</h3>
      
      <ClassList 
        classes={classes}
        teacherId={teacherId}
        isAdmin={isAdmin}
        loading={loading}
        onOpenAddStudentDialog={openAddStudentDialog}
        onDeleteClass={openDeleteDialog}
      />
      
      {/* Add Student Dialog */}
      <AddStudentsDialog
        isOpen={isAddStudentDialogOpen}
        onClose={() => setIsAddStudentDialogOpen(false)}
        selectedClassId={null} // We pass this through the openAddStudentDialog function
        availableStudents={availableStudents}
        onAddStudents={handleAddStudents}
      />
      
      {/* Delete Class Confirmation Dialog */}
      <DeleteClassDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteClass}
      />
    </div>
  );
};

export default ClassManagement;
