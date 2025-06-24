
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AddStudentDialog from "./AddStudentDialog";

interface StudentsManagementProps {
  teacherId: string;
  teacherData: any;
  onTeacherDataUpdate: (newData: any) => void;
}

interface Student {
  id: string;
  username: string;
  display_name: string;
  school_name?: string;
  coins: number;
  created_at: string;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({
  teacherId,
  teacherData,
  onTeacherDataUpdate
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      // Get students created by this teacher
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          created_at,
          school_id,
          schools!inner (name)
        `)
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get student profiles for coin information
      if (studentsData && studentsData.length > 0) {
        const studentIds = studentsData.map(s => s.id);
        const { data: profilesData } = await supabase
          .from('student_profiles')
          .select('user_id, coins')
          .in('user_id', studentIds);

        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.user_id, profile);
          });
        }

        const enrichedStudents = studentsData.map(student => ({
          id: student.id,
          username: student.username,
          display_name: student.display_name || student.username,
          school_name: (student.schools as any)?.name || "No School",
          coins: profilesMap.get(student.id)?.coins || 0,
          created_at: student.created_at
        }));

        setStudents(enrichedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudentProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const handleViewRankings = () => {
    navigate('/teacher-ranking');
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleViewRankings}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            View Rankings
          </Button>
          <Button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Student
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my-students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-students">My Students</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="my-students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? "No students found matching your search" : "No students created yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setIsAddStudentOpen(true)}
                      className="mt-4"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Your First Student
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <Card 
                      key={student.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewStudentProfile(student.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                              {(student.display_name || student.username)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{student.display_name}</p>
                              <p className="text-sm text-gray-500">@{student.username}</p>
                              <p className="text-xs text-gray-400">{student.school_name}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">
                              💰 {student.coins} coins
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">View teacher and student rankings</p>
              <Button onClick={handleViewRankings}>
                View Rankings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddStudentDialog
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        teacherId={teacherId}
        teacherData={teacherData}
        onTeacherDataUpdate={(newData) => {
          onTeacherDataUpdate(newData);
          loadStudents(); // Refresh students list
        }}
      />
    </div>
  );
};

export default StudentsManagement;
