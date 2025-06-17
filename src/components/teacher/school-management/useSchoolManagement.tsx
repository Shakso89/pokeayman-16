
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface SchoolWithCounts {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}

interface SelectedClassData {
  id: string;
  name: string;
  students: any[];
}

export const useSchoolManagement = (teacherId: string) => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManageClassOpen, setIsManageClassOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassData, setSelectedClassData] = useState<SelectedClassData | null>(null);
  const [schoolPoolDialogOpen, setSchoolPoolDialogOpen] = useState(false);

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

  const handleManageClasses = async (schoolId: string) => {
    console.log("Managing classes for school:", schoolId);
    
    try {
      // Fetch a representative class from this school to manage
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          teacher_id
        `)
        .eq('school_id', schoolId)
        .eq('teacher_id', teacherId)
        .limit(1)
        .single();

      if (classError || !classData) {
        console.log("No classes found for this teacher in this school");
        toast({
          title: t("info"),
          description: "No classes found in this school. Create a class first.",
          variant: "default"
        });
        return;
      }

      // Fetch students for this class using the student_classes join table
      const { data: studentClassData, error: studentError } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          student_profiles!inner(
            id,
            user_id,
            username,
            display_name
          )
        `)
        .eq('class_id', classData.id);

      if (studentError) {
        console.error("Error fetching students:", studentError);
      }

      const students = studentClassData?.map((sc: any) => ({
        id: sc.student_profiles.user_id || sc.student_profiles.id,
        displayName: sc.student_profiles.display_name || sc.student_profiles.username,
        username: sc.student_profiles.username,
        schoolId: schoolId
      })) || [];

      console.log("Students found for class:", students);

      setSelectedClassData({
        id: classData.id,
        name: classData.name,
        students: students
      });
      setSelectedSchoolId(schoolId);
      setIsManageClassOpen(true);
    } catch (error) {
      console.error("Error managing classes:", error);
      toast({
        title: t("error"),
        description: "Failed to load class data",
        variant: "destructive"
      });
    }
  };

  const handleViewSchoolPool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setSchoolPoolDialogOpen(true);
  };

  const handleManageClassDialogClose = (open: boolean) => {
    setIsManageClassOpen(open);
    if (!open) {
      setSelectedSchoolId("");
      setSelectedClassData(null);
      // Refresh counts when dialog closes
      fetchSchoolsWithCounts();
    }
  };

  useEffect(() => {
    fetchSchoolsWithCounts();
  }, [teacherId]);

  return {
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
  };
};
