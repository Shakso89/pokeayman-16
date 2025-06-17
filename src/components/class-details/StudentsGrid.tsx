
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Coins, Users, Trash, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  coins?: number;
  school_id?: string;
  user_id?: string; // Add user_id for proper student identification
}

interface StudentsGridProps {
  students: Student[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  onRemovePokemon: (studentId: string, studentName: string) => void;
  classData: any;
}

const StudentsGrid: React.FC<StudentsGridProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData,
}) => {
  const navigate = useNavigate();

  const handleViewProfile = (studentId: string) => {
    navigate(`/student-profile/${studentId}`);
  };

  const handleGiveCoins = (student: Student) => {
    const studentName = student.display_name || student.username || "Student";
    // Use user_id if available, otherwise fall back to id
    const studentId = student.user_id || student.id;
    console.log("Awarding coins to student:", { studentId, studentName, originalId: student.id });
    onAwardCoins(studentId, studentName);
  };

  const handleManagePokemon = (student: Student) => {
    const studentName = student.display_name || student.username || "Student";
    const schoolId = student.school_id || classData?.schoolId || classData?.school_id || "";
    // Use user_id if available, otherwise fall back to id
    const studentId = student.user_id || student.id;
    console.log("Managing Pokemon for:", { studentId, studentName, schoolId, originalId: student.id });
    onManagePokemon(studentId, studentName, schoolId);
  };

  const handleRemoveCoins = (student: Student) => {
    const studentName = student.display_name || student.username || "Student";
    // Use user_id if available, otherwise fall back to id
    const studentId = student.user_id || student.id;
    onRemoveCoins(studentId, studentName);
  };

  const handleRemoveStudent = (student: Student) => {
    const studentName = student.display_name || student.username || "Student";
    onRemoveStudent(student.id, studentName); // Always use the database ID for removal
  };

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No students in this class yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <Card key={student.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.avatar} alt={student.display_name || student.username} />
                <AvatarFallback>
                  {(student.display_name || student.username || "S")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {student.display_name || student.username}
                </h3>
                <p className="text-sm text-gray-500">@{student.username}</p>
                {student.user_id && (
                  <p className="text-xs text-gray-400">ID: {student.user_id}</p>
                )}
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex-1 bg-yellow-50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Coins</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-700">{student.coins || 0}</p>
                </div>
                
                <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-medium text-purple-800">Pokémon</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">0</p>
                </div>
              </div>

              <div className="w-full space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewProfile(student.id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>

                {isClassCreator && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleGiveCoins(student)}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Give Coins
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleManagePokemon(student)}
                    >
                      Manage Pokémon
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRemoveCoins(student)}
                      >
                        Remove Coins
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRemoveStudent(student)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentsGrid;
