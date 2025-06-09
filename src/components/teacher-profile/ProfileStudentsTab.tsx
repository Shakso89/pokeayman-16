
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  username: string;
  display_name?: string;
  created_at: string;
}

interface ProfileStudentsTabProps {
  teacherId: string;
  studentCount: number;
}

export const ProfileStudentsTab: React.FC<ProfileStudentsTabProps> = ({
  teacherId,
  studentCount
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStudents = async () => {
      if (!teacherId) return;
      
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading students:', error);
          return;
        }

        setStudents(data || []);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [teacherId]);

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/profile/${studentId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <p className="text-sm text-gray-500">
          Total students: {studentCount}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div 
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" alt={student.display_name || student.username} />
                    <AvatarFallback>
                      {(student.display_name || student.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{student.display_name || student.username}</h4>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(student.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No students yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
