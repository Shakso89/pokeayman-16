import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Eye, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DeleteClassDialog from "./DeleteClassDialog";

interface ClassWithCount {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  school_id: string;
  student_count: number;
  created_at: string;
}

interface ClassListProps {
  schoolId: string;
  teacherId: string;
  onRefresh?: () => void;
}

const ClassList: React.FC<ClassListProps> = ({ schoolId, teacherId, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    classId: string;
    className: string;
  }>({
    open: false,
    classId: "",
    className: ""
  });

  useEffect(() => {
    if (schoolId) {
      fetchClassesWithCounts();
    }
  }, [schoolId, teacherId]);

  const fetchClassesWithCounts = async () => {
    setLoading(true);
    try {
      // Get classes in this school
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      if (!classesData) {
        setClasses([]);
        return;
      }

      // For each class, get accurate student count
      const classesWithCounts = await Promise.all(
        classesData.map(async (classItem) => {
          // Count students in this class through student_classes join table
          const { count: studentCount } = await supabase
            .from('student_classes')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classItem.id);

          return {
            ...classItem,
            student_count: studentCount || 0
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: t("error"),
        description: "Failed to load classes",
        variant: "destructive"
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      // First remove all student-class relationships
      await supabase
        .from('student_classes')
        .delete()
        .eq('class_id', classId);

      // Then delete the class
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: t("success"),
        description: "Class deleted successfully"
      });

      fetchClassesWithCounts(); // Refresh the list
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: "Failed to delete class",
        variant: "destructive"
      });
    } finally {
      setDeleteDialog({ open: false, classId: "", className: "" });
    }
  };

  const handleViewClass = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Classes ({classes.length})</h3>
        <Button onClick={fetchClassesWithCounts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Counts
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No classes found in this school</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                {classItem.description && (
                  <p className="text-sm text-gray-600">{classItem.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {classItem.student_count} students
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewClass(classItem.id)}
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Class
                  </Button>
                  
                  <Button
                    onClick={() => setDeleteDialog({
                      open: true,
                      classId: classItem.id,
                      className: classItem.name
                    })}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteClassDialog
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirmDelete={() => handleDeleteClass(deleteDialog.classId)}
        classId={deleteDialog.classId}
      />
    </div>
  );
};

export default ClassList;
