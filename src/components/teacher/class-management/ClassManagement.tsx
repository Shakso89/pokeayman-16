
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Users, Settings, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddStudentsDialog from "./AddStudentsDialog";
import DeleteClassDialog from "./DeleteClassDialog";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
}

interface Class {
  id: string;
  name: string;
  description?: string;
  students: string[];
  teacher_id: string;
  teacher_name?: string;
  is_public: boolean;
  created_at: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({
  onBack,
  schoolId,
  teacherId,
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loadSchoolAndClasses = async () => {
    setIsLoading(true);
    try {
      // Load school name
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();
      
      if (schoolData) {
        setSchoolName(schoolData.name);
      }

      // Load classes for this school with teacher information
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          teachers!inner(display_name)
        `)
        .eq('school_id', schoolId);

      if (classesError) {
        console.error('Error loading classes:', classesError);
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive"
        });
      } else {
        const processedClasses = (classesData || []).map(cls => ({
          ...cls,
          teacher_name: cls.teachers?.display_name || 'Unknown Teacher'
        }));
        setClasses(processedClasses);
      }
    } catch (error) {
      console.error('Error loading school data:', error);
      toast({
        title: "Error",
        description: "Failed to load school data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchoolAndClasses();
  }, [schoolId]);

  const handleViewClass = (classData: Class) => {
    navigate(`/class/${classData.id}`);
  };

  const handleDeleteClass = (classData: Class) => {
    setClassToDelete(classData);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!classToDelete) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully"
      });

      // Refresh classes list
      loadSchoolAndClasses();
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{schoolName} - Classes</h2>
          <p className="text-gray-600">{classes.length} classes found</p>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No classes found in this school</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {classes.map((classData) => (
            <Card key={classData.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{classData.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Teacher: {classData.teacher_name}
                    </p>
                    {classData.description && (
                      <p className="text-sm text-gray-500 mt-1">{classData.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={classData.is_public ? "default" : "secondary"}>
                      {classData.is_public ? "Public" : "Private"}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {classData.students?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClass(classData)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Class
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClass(classData);
                      setIsAddStudentsOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Students
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClass(classData)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddStudentsDialog
        open={isAddStudentsOpen}
        onOpenChange={setIsAddStudentsOpen}
        classId={selectedClass?.id || ""}
        className={selectedClass?.name || ""}
        onStudentsAdded={() => {
          loadSchoolAndClasses();
          setIsAddStudentsOpen(false);
        }}
      />

      <DeleteClassDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        className={classToDelete?.name || ""}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
};

export default ClassManagement;
