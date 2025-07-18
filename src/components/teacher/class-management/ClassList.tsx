
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Trash2, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getClassesBySchool } from "@/utils/classSync/classOperations";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClassListProps {
  schoolId: string;
  teacherId: string;
  onRefresh: () => void;
}

interface ClassWithStudentCount {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  is_public: boolean;
  studentCount: number;
}

const ClassList: React.FC<ClassListProps> = ({ schoolId, teacherId, onRefresh }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassWithStudentCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      console.log("Fetching classes for school:", schoolId);
      const schoolClasses = await getClassesBySchool(schoolId);
      console.log("Fetched classes:", schoolClasses);
      
      const classesWithCounts = await Promise.all(
        schoolClasses.map(async (classItem) => {
          const { count: studentCount } = await supabase
            .from('student_classes')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classItem.id);

          return {
            id: classItem.id,
            name: classItem.name,
            description: classItem.description,
            created_at: classItem.created_at,
            is_public: classItem.is_public || false,
            studentCount: studentCount || 0
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-classes"),
        variant: "destructive"
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManageClass = (classId: string) => {
    console.log("Navigating to manage class:", classId);
    navigate(`/class/${classId}`);
  };

  const handleViewClass = (classId: string) => {
    console.log("Navigating to view class:", classId);
    // Ensure we're navigating to the correct route
    navigate(`/class/${classId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("loading-classes")}</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 mb-4">{t("no-classes-found")}</p>
          <p className="text-sm text-gray-400">{t("create-your-first-class")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classItem) => (
        <Card key={classItem.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {classItem.studentCount} {t("students")}
              </Badge>
            </div>
            {classItem.description && (
              <p className="text-sm text-gray-600">{classItem.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>{t("created")}: {new Date(classItem.created_at).toLocaleDateString()}</p>
                {classItem.is_public ? (
                  <Badge variant="outline" className="mt-1">
                    {t("public")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-1">
                    {t("private")}
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClass(classItem.id)}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t("view")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleManageClass(classItem.id)}
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {t("manage")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClassList;
