
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, KeyRound, Eye, EyeOff, School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { StudentsList } from "@/components/student-profile/StudentsList";
import { useNavigate } from "react-router-dom";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";

interface StudentsTabProps {
  classId: string;
  viewOnly?: boolean;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId, viewOnly = false }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [classId]);
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching students for class:", classId);
      
      // Fetch student IDs from the student_classes join table
      const { data: studentLinks, error: linksError } = await supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId);

      if (linksError) {
        console.error("❌ Error fetching student links:", linksError);
        throw linksError;
      }

      console.log("📋 Found student links:", studentLinks?.length || 0);

      if (!studentLinks || studentLinks.length === 0) {
        console.log("ℹ️ No students found in class");
        setStudents([]);
        return;
      }
      
      const studentIds = studentLinks.map(link => link.student_id);
      console.log("🆔 Student IDs to fetch:", studentIds);
      
      // Fetch student details with school information and their profiles for coins/pokemon data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          schools:school_id (
            id,
            name
          ),
          student_profiles!inner (
            coins,
            spent_coins,
            avatar_url
          )
        `)
        .in('id', studentIds);
        
      if (studentsError) {
        console.error("❌ Error fetching students data:", studentsError);
        throw studentsError;
      }
      
      console.log("✅ Students data fetched:", studentsData?.length || 0);
      
      // Add school name and profile data to each student
      const studentsWithData = (studentsData || []).map(student => ({
        ...student,
        schoolName: student.schools?.name || "No School Assigned",
        coins: student.student_profiles?.[0]?.coins || 0,
        spent_coins: student.student_profiles?.[0]?.spent_coins || 0,
        avatar_url: student.student_profiles?.[0]?.avatar_url
      }));
      
      setStudents(studentsWithData);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-students"),
        variant: "destructive"
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentsAdded = async (studentIds: string[]) => {
    if (studentIds.length > 0) {
      console.log("🎯 Adding students to class:", studentIds);
      
      try {
        // Use the proper student operations function
        const success = await addMultipleStudentsToClass(classId, studentIds);
        
        if (success) {
          toast({
            title: t("success"),
            description: `${studentIds.length} ${t("students-added-to-class")}`
          });
          
          // Refresh student list after successful addition
          console.log("🔄 Refreshing student list...");
          await fetchStudents();
        } else {
          throw new Error("Failed to add students to class");
        }
      } catch (error) {
        console.error("❌ Error adding students to class:", error);
        toast({
          title: t("error"),
          description: t("failed-to-add-students"),
          variant: "destructive"
        });
      }
    }
  };
  
  const handleViewStudentProfile = (studentId: string) => {
    if (viewOnly) {
      navigate(`/student-profile/${studentId}`);
    } else {
      navigate(`/teacher/student/${studentId}`);
    }
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
        {!viewOnly && (
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
        )}
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
                      {/* Display school information */}
                      <div className="flex items-center mt-1">
                        <School className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {student.schoolName || "No School Assigned"}
                        </span>
                      </div>
                      {/* Display coins information */}
                      <div className="text-xs text-blue-600 mt-1">
                        💰 {student.coins} coins | Spent: {student.spent_coins}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Password display section */}
                    {!viewOnly && (
                      <div className="flex items-center">
                        <KeyRound className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm font-mono">
                          {showPasswords 
                            ? (student.password || student.password_hash || t("no-password")) 
                            : '••••••••'
                          }
                        </span>
                      </div>
                    )}
                    
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

      {!viewOnly && (
        <StudentsList
          classId={classId}
          open={isAddStudentOpen}
          onOpenChange={setIsAddStudentOpen}
          onStudentsAdded={handleStudentsAdded}
          viewMode={false}
        />
      )}
    </div>
  );
};

export default StudentsTab;
