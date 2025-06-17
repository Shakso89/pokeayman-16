
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, School, Users, BookOpen, Eye, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import ManageClassDialog from "@/components/dialogs/ManageClassDialog";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";

interface SchoolManagementProps {
  onBack: () => void;
  onSelectSchool: (schoolId: string) => void;
  teacherId: string;
}

interface SchoolWithCounts {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({
  onBack,
  onSelectSchool,
  teacherId
}) => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [schoolPoolDialogOpen, setSchoolPoolDialogOpen] = useState(false);

  useEffect(() => {
    fetchSchoolsWithCounts();
  }, [teacherId]);

  const fetchSchoolsWithCounts = async () => {
    setLoading(true);
    try {
      console.log("Fetching schools with accurate counts...");
      
      // Get all schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (schoolsError) throw schoolsError;

      if (!schoolsData) {
        setSchools([]);
        return;
      }

      // For each school, get accurate counts using proper joins
      const schoolsWithCounts = await Promise.all(
        schoolsData.map(async (school) => {
          console.log(`Counting for school: ${school.name} (${school.id})`);
          
          // Count classes in this school
          const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id);

          // Count students in this school through the student_classes join table
          const { data: studentClassData, error: studentClassError } = await supabase
            .from('student_classes')
            .select(`
              student_id,
              classes!inner(school_id)
            `)
            .eq('classes.school_id', school.id);

          if (studentClassError) {
            console.error(`Error counting students for school ${school.id}:`, studentClassError);
          }

          // Get unique student count
          const uniqueStudentIds = new Set(studentClassData?.map(sc => sc.student_id) || []);
          const studentCount = uniqueStudentIds.size;

          console.log(`School ${school.name}: ${classCount || 0} classes, ${studentCount} students`);

          return {
            id: school.id,
            name: school.name,
            student_count: studentCount,
            class_count: classCount || 0
          };
        })
      );

      console.log("Final schools with counts:", schoolsWithCounts);
      setSchools(schoolsWithCounts);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: t("error"),
        description: "Failed to load schools",
        variant: "destructive"
      });
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = (schoolId: string) => {
    console.log("Opening create class dialog for school:", schoolId);
    setSelectedSchoolId(schoolId);
    setIsCreateClassOpen(true);
  };

  const handleClassCreated = () => {
    console.log("Class created successfully, refreshing counts");
    fetchSchoolsWithCounts(); // Refresh counts after creating a class
    setIsCreateClassOpen(false);
    toast({
      title: t("success"),
      description: "Class created successfully"
    });
  };

  const handleViewSchoolPool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setSchoolPoolDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateClassOpen(open);
    if (!open) {
      // Reset selected school when dialog closes
      setSelectedSchoolId("");
    }
  };

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

      {schools.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No schools found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  {school.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="font-bold text-blue-600">{school.student_count}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <BookOpen className="h-5 w-5 mx-auto text-green-600 mb-1" />
                    <p className="text-sm text-gray-600">Classes</p>
                    <p className="font-bold text-green-600">{school.class_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSchoolPool(school.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Pool
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSchoolsWithCounts()}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleCreateClass(school.id)}
                    className="w-full"
                    size="sm"
                  >
                    Create Class in {school.name}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onSelectSchool(school.id)}
                    className="w-full"
                    size="sm"
                  >
                    Manage Classes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced ManageClassDialog with proper callback handling */}
      {selectedSchoolId && (
        <ManageClassDialog
          open={isCreateClassOpen}
          onOpenChange={handleDialogOpenChange}
          teacherId={teacherId}
          classId=""
          className=""
          students={[]}
          onClassCreated={handleClassCreated}
          schoolId={selectedSchoolId}
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
