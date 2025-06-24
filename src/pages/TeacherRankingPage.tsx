
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, BookOpen, Medal, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeacherRanking {
  id: string;
  display_name: string;
  username: string;
  student_count: number;
  class_count: number;
  total_score: number;
  avatar_url?: string;
  school_name?: string;
}

const TeacherRankingPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const [rankings, setRankings] = useState<TeacherRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      loadRankings();
    }
  }, [teacherId]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      
      // Get all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select("*");

      if (teachersError) throw teachersError;

      if (teachers) {
        // Get class and student counts for each teacher
        const teachersWithStats = await Promise.all(
          teachers.map(async (teacher) => {
            // Get class count
            const { data: classData } = await supabase
              .from("classes")
              .select("id")
              .eq("teacher_id", teacher.id);

            const classCount = classData?.length || 0;

            // Get student count
            const { data: studentData } = await supabase
              .from("student_profiles")
              .select("id")
              .eq("teacher_id", teacher.id);

            const studentCount = studentData?.length || 0;
            const totalScore = (classCount * 10) + (studentCount * 2);

            return {
              id: teacher.id,
              display_name: teacher.display_name,
              username: teacher.username,
              student_count: studentCount,
              class_count: classCount,
              total_score: totalScore,
              avatar_url: teacher.avatar_url,
              school_name: teacher.school_id // This would need to be resolved
            };
          })
        );

        // Sort by total score
        teachersWithStats.sort((a, b) => b.total_score - a.total_score);
        setRankings(teachersWithStats);
      }
    } catch (error) {
      console.error("Error loading teacher rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-300" />;
    }
  };

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="teacher" userName={localStorage.getItem("teacherName") || "Teacher"} />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Teacher Rankings
            </CardTitle>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No rankings available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rankings.map((teacher, index) => (
              <Card key={teacher.id} className={`${index < 3 ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' : ''} ${teacher.id === teacherId ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span className="font-bold text-2xl">#{index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {teacher.avatar_url ? (
                            <img src={teacher.avatar_url} alt={teacher.display_name} className="w-12 h-12 rounded-full" />
                          ) : (
                            <span className="text-lg font-bold">{teacher.display_name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{teacher.display_name}</h3>
                          <p className="text-sm text-gray-500">@{teacher.username}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {teacher.class_count} classes
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {teacher.student_count} students
                        </Badge>
                        <Badge className="bg-blue-600 text-white font-bold">
                          {teacher.total_score} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherRankingPage;
