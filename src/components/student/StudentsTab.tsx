
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { StudentsList } from "@/components/student-profile/StudentsList";
import { useNavigate } from "react-router-dom";

interface StudentsTabProps {
  classId: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false); // State to toggle password visibility
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [classId]);
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // First try to get the class to retrieve student IDs
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
        
      if (classError) throw classError;
      
      if (!classData || !classData.students || classData.students.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Fetch student details using the IDs from the class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', classData.students);
        
      if (studentsError) throw studentsError;
      
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      
      // Try to get from localStorage as fallback
      try {
        // Get class data from localStorage
        const savedClasses = localStorage.getItem("classes");
        if (savedClasses) {
          const parsedClasses = JSON.parse(savedClasses);
          const foundClass = parsedClasses.find((cls: any) => cls.id === classId);
          
          if (foundClass && foundClass.students && foundClass.students.length > 0) {
            // Get student data from localStorage
            const savedStudents = localStorage.getItem("students");
            if (savedStudents) {
              const parsedStudents = JSON.parse(savedStudents);
              const classStudents = parsedStudents.filter((student: any) => 
                foundClass.students.includes(student.id)
              );
              setStudents(classStudents);
            }
          } else {
            setStudents([]);
          }
        }
      } catch (localStorageError) {
        console.error("Error accessing localStorage:", localStorageError);
        toast({
          title: t("error"),
          description: t("failed-to-load-students"),
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentsAdded = (studentIds: string[]) => {
    if (studentIds.length > 0) {
      toast({
        title: t("success"),
        description: `${studentIds.length} ${t("students-added-to-class")}`
      });
      fetchStudents(); // Refresh student list
    }
  };
  
  const handleViewStudentProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
        <span>{t("loading-students")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("students")} ({students.length})
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowPasswords(!showPasswords)}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            {showPasswords ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                {t("hide-passwords")}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                {t("show-passwords")}
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsAddStudentOpen(true)}
            size="sm"
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {t("add-students")}
          </Button>
        </div>
      </div>
      
      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">{t("no-students-in-class")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Card 
              key={student.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => handleViewStudentProfile(student.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                      {(student.display_name || student.username || '??')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{student.display_name || student.username}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Password display section */}
                    <div className="flex items-center">
                      <KeyRound className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm font-mono">
                        {showPasswords 
                          ? (student.password || student.password_hash || t("no-password")) 
                          : '••••••••'
                        }
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent onClick
                        handleViewStudentProfile(student.id);
                      }}
                    >
                      {t("view-profile")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentsList
        classId={classId}
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
        onStudentsAdded={handleStudentsAdded}
        viewMode={false}
      />
    </div>
  );
};

export default StudentsTab;
