
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import ManageClassDialog from "@/components/dialogs/ManageClassDialog";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import SchoolsGrid from "./school-management/SchoolsGrid";
import { useSchoolManagement } from "./school-management/useSchoolManagement";

interface SchoolManagementProps {
  onBack: () => void;
  onSelectSchool: (schoolId: string) => void;
  teacherId: string;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({
  onBack,
  onSelectSchool,
  teacherId
}) => {
  const { t } = useTranslation();
  const {
    schools,
    loading,
    isManageClassOpen,
    selectedSchoolId,
    selectedClassData,
    schoolPoolDialogOpen,
    fetchSchoolsWithCounts,
    handleManageClasses,
    handleViewSchoolPool,
    handleManageClassDialogClose,
    setSchoolPoolDialogOpen
  } = useSchoolManagement(teacherId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">School Management</h1>
        </div>
        <div className="text-center py-8">Loading schools...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">School Management</h1>
        </div>
        <Button onClick={fetchSchoolsWithCounts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Counts
        </Button>
      </div>

      <SchoolsGrid
        schools={schools}
        onViewSchoolPool={handleViewSchoolPool}
        onRefresh={fetchSchoolsWithCounts}
        onSelectSchool={onSelectSchool}
        onManageClasses={handleManageClasses}
      />

      {/* Manage Class Dialog */}
      {selectedClassData && (
        <ManageClassDialog
          open={isManageClassOpen}
          onOpenChange={handleManageClassDialogClose}
          teacherId={teacherId}
          classId={selectedClassData.id}
          className={selectedClassData.name}
          students={selectedClassData.students}
        />
      )}

      <SchoolPokemonPoolDialog
        isOpen={schoolPoolDialogOpen}
        onOpenChange={setSchoolPoolDialogOpen}
        schoolId={selectedSchoolId}
      />
    </div>
  );
};

export default SchoolManagement;
