
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Award, Trash2, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentBadges from "@/components/student/StudentBadges";

interface Student {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  coins: number;
  school_id?: string;
  pokemon_count?: number;
}

interface StudentsGridProps {
  students: Student[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  onRemovePokemon: (studentId: string, studentName: string) => void;
  classData?: {
    id: string;
    star_student_id?: string;
    top_student_id?: string;
    school_id?: string;
    schools?: {
      id: string;
      name: string;
      top_student_id?: string;
    };
  };
}

const StudentsGrid: React.FC<StudentsGridProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData
}) => {
  const navigate = useNavigate();

  const handleViewProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No students in this class yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => {
        const studentName = student.display_name || student.username;
        const schoolData = classData?.schools ? {
          top_student_id: classData.schools.top_student_id
        } : undefined;

        return (
          <Card key={student.id} className="hover:shadow-md transition-shadow relative">
            <CardContent className="p-4">
              {/* Badges positioned at top-right of card */}
              <div className="absolute -top-2 -right-2 z-10">
                <StudentBadges
                  studentId={student.user_id}
                  classData={{
                    star_student_id: classData?.star_student_id,
                    top_student_id: classData?.top_student_id
                  }}
                  schoolData={schoolData}
                  size="md"
                  position="relative"
                />
              </div>

              <div className="flex flex-col items-center text-center mb-4">
                {/* Student Avatar */}
                <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-xl mb-2">
                  {studentName[0]?.toUpperCase()}
                </div>
                
                {/* Student Name and Username */}
                <h3 className="font-semibold text-gray-900 mb-1">{studentName}</h3>
                <p className="text-sm text-gray-500 mb-2">@{student.username}</p>
                
                {/* Context badges below name */}
                <div className="mb-3">
                  <StudentBadges
                    studentId={student.user_id}
                    classData={{
                      star_student_id: classData?.star_student_id,
                      top_student_id: classData?.top_student_id
                    }}
                    schoolData={schoolData}
                    size="sm"
                    position="relative"
                    showContext={true}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-6 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span>{student.coins || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>{student.pokemon_count || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(student.user_id)}
                  className="w-full"
                >
                  View Profile
                </Button>
                
                {isClassCreator && (
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAwardCoins(student.user_id, studentName)}
                      title="Award Coins"
                    >
                      <Coins className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onManagePokemon(
                        student.user_id, 
                        studentName, 
                        student.school_id || classData?.school_id || ""
                      )}
                      title="Manage Pokémon"
                    >
                      <Award className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveCoins(student.user_id, studentName)}
                      title="Remove Coins"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveStudent(student.user_id, studentName)}
                      title="Remove Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentsGrid;
