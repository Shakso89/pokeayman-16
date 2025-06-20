
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, Eye, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import { forceUpdateAllSchoolPools } from "@/utils/pokemon/schoolPokemon";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SchoolInfoCardProps {
  schoolId: string;
  teacherId: string;
  isAdmin: boolean;
  classId?: string;
}

interface SchoolData {
  name: string;
  studentCount: number;
  classCount: number;
}

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({ schoolId, teacherId, isAdmin, classId }) => {
  const { t } = useTranslation();
  const [schoolPoolOpen, setSchoolPoolOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: "Loading...",
    studentCount: 0,
    classCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchoolData();
  }, [schoolId]);

  const fetchSchoolData = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      // Get school basic info
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();

      if (schoolError) {
        console.error('Error fetching school:', schoolError);
        return;
      }

      // Count classes in this school
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      // Count students in this school through the student_classes join table
      const { data: studentClassData, error: studentClassError } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          classes!inner(school_id)
        `)
        .eq('classes.school_id', schoolId);

      if (studentClassError) {
        console.error('Error counting students:', studentClassError);
      }

      // Get unique student count
      const uniqueStudentIds = new Set(studentClassData?.map(sc => sc.student_id) || []);
      const studentCount = uniqueStudentIds.size;

      setSchoolData({
        name: school?.name || "Unknown School",
        studentCount,
        classCount: classCount || 0
      });
    } catch (error) {
      console.error('Error fetching school data:', error);
      toast({
        title: t("error"),
        description: "Failed to load school information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPool = async () => {
    if (!isAdmin) {
      toast({
        title: t("error"),
        description: "Only admins can refresh the school Pokémon pool",
        variant: "destructive"
      });
      return;
    }

    setRefreshing(true);
    try {
      const success = await forceUpdateAllSchoolPools();
      if (success) {
        toast({
          title: t("success"),
          description: "School Pokémon pool has been refreshed with 500 new unique Pokémon"
        });
      } else {
        throw new Error("Pool refresh failed");
      }
    } catch (error) {
      console.error("Error refreshing pool:", error);
      toast({
        title: t("error"),
        description: "Failed to refresh school Pokémon pool",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card className="pokemon-card">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Loading school information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-500" />
            {t("school-information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-gray-500" />
              <span>{schoolData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{schoolData.studentCount} {t("students")}</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-gray-500" />
              <span>{schoolData.classCount} {t("classes")}</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => setSchoolPoolOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("view-school-pool")}
            </Button>
            
            {isAdmin && (
              <Button 
                onClick={handleRefreshPool}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t("refreshing") : t("refresh-pool")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SchoolPokemonPoolDialog
        isOpen={schoolPoolOpen}
        onOpenChange={setSchoolPoolOpen}
        schoolId={schoolId}
      />
    </>
  );
};

export default SchoolInfoCard;
