
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Coins, 
  Award, 
  UserMinus, 
  Minus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentsGridProps {
  students: any[];
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
  classData
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStudentClick = (studentId: string) => {
    navigate(`/student-detail/${studentId}`);
  };

  if (students.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="py-12 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Students Yet</h3>
          <p className="text-gray-500">Add students to get started with your class</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <Card 
          key={student.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300"
          onClick={() => handleStudentClick(student.id)}
        >
          <CardContent className="p-6">
            {/* Student Avatar and Info */}
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                {(student.display_name || student.displayName || student.username || '')
                  .substring(0, 1)
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {student.display_name || student.displayName || student.username}
                </h3>
                <p className="text-sm text-gray-500">@{student.username}</p>
              </div>
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <Coins className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-xs font-medium text-yellow-700">Coins</span>
                </div>
                <span className="text-lg font-bold text-yellow-800">
                  {student.coins || 0}
                </span>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-xs font-medium text-purple-700">Pokémon</span>
                </div>
                <span className="text-lg font-bold text-purple-800">
                  {student.pokemonCount || 0}
                </span>
              </div>
            </div>

            {/* Action Buttons - Only show for class creator */}
            {isClassCreator && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAwardCoins(student.id, student.display_name || student.displayName || student.username);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs"
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    Award
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCoins(student.id, student.display_name || student.displayName || student.username);
                    }}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-xs"
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Coins
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onManagePokemon(
                        student.id, 
                        student.display_name || student.displayName || student.username,
                        student.schoolId || classData?.school_id || ''
                      );
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Give
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePokemon(student.id, student.display_name || student.displayName || student.username);
                    }}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs"
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Pokémon
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStudent(student.id, student.display_name || student.displayName || student.username);
                  }}
                  className="w-full text-xs"
                >
                  <UserMinus className="h-3 w-3 mr-1" />
                  Remove Student
                </Button>
              </div>
            )}

            {/* View Profile Button */}
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStudentClick(student.id);
                }}
                className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentsGrid;
