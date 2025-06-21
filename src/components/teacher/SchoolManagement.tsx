
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
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">School Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold truncate">School Management</h1>
        </div>
        <Button onClick={fetchSchoolsWithCounts} variant="outline" className="flex-shrink-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Counts
        </Button>
      </div>

      <div className="w-full overflow-hidden">
        <SchoolsGrid
          schools={schools}
          onViewSchoolPool={handleViewSchoolPool}
          onRefresh={fetchSchoolsWithCounts}
          onSelectSchool={onSelectSchool}
          onManageClasses={handleManageClasses}
        />
      </div>

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
