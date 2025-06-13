
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Coins, Award, UserMinus, Minus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { updateStudentCoins } from "@/services/studentDatabase";
import { toast } from "sonner";

interface StudentsTableProps {
  students: any[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onAddStudent: () => void;
  classData: any;
  onRemoveCoins?: (studentId: string, studentName: string) => void;
  onRemovePokemon?: (studentId: string, studentName: string) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onAddStudent,
  classData,
  onRemoveCoins,
  onRemovePokemon
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStudentClick = (studentId: string) => {
    // Navigate to the student detail page using the correct route
    navigate(`/student-detail/${studentId}`);
  };

  const handleAwardCoins = async (studentId: string, studentName: string) => {
    try {
      // Award 10 coins as default (you can make this configurable)
      const success = await updateStudentCoins(studentId, 10);
      if (success) {
        toast.success(`10 coins awarded to ${studentName}`);
        // Trigger refresh of student data
        window.location.reload();
      } else {
        toast.error("Failed to award coins");
      }
    } catch (error) {
      console.error("Error awarding coins:", error);
      toast.error("Failed to award coins");
    }
  };

  const handleRemoveCoins = async (studentId: string, studentName: string) => {
    try {
      // Remove 5 coins as default (you can make this configurable)
      const success = await updateStudentCoins(studentId, -5, 5);
      if (success) {
        toast.success(`5 coins removed from ${studentName}`);
        // Trigger refresh of student data
        window.location.reload();
      } else {
        toast.error("Failed to remove coins");
      }
    } catch (error) {
      console.error("Error removing coins:", error);
      toast.error("Failed to remove coins");
    }
  };

  const handleRemovePokemon = (studentId: string, studentName: string) => {
    if (onRemovePokemon) {
      onRemovePokemon(studentId, studentName);
    } else {
      // Fallback implementation
      console.log("Remove pokemon for:", studentName);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("students")} ({students.length})
          </CardTitle>
          {isClassCreator && (
            <Button onClick={onAddStudent} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("add-students")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t("no-students-in-class")}</p>
            {isClassCreator && (
              <Button onClick={onAddStudent} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t("add-first-student")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="flex items-center space-x-4 cursor-pointer flex-1"
                  onClick={() => handleStudentClick(student.id)}
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                    {(student.display_name || student.displayName || student.username || '')
                      .substring(0, 1)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 hover:text-blue-600">
                      {student.display_name || student.displayName || student.username}
                    </p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        💰 {student.coins || 0} coins
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        🎮 {student.pokemonCount || 0} pokemon
                      </span>
                    </div>
                  </div>
                </div>

                {isClassCreator && (
                  <div className="flex items-center gap-2">
                    {/* Award Coins */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAwardCoins(student.id, student.display_name || student.displayName || student.username);
                      }}
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex items-center gap-1"
                    >
                      <Coins className="h-4 w-4" />
                      <span className="hidden sm:inline">Award Coin</span>
                    </Button>
                    
                    {/* Remove Coins */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCoins(student.id, student.display_name || student.displayName || student.username);
                      }}
                      className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove Coin</span>
                    </Button>
                    
                    {/* Manage Pokemon */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onManagePokemon(
                          student.id, 
                          student.display_name || student.displayName || student.username,
                          student.schoolId || classData?.school_id || ''
                        );
                      }}
                      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 flex items-center gap-1"
                    >
                      <Award className="h-4 w-4" />
                      <span className="hidden sm:inline">Manage Pokémon</span>
                    </Button>
                    
                    {/* Remove Pokemon */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePokemon(student.id, student.display_name || student.displayName || student.username);
                      }}
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 flex items-center gap-1"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove Pokémon</span>
                    </Button>
                    
                    {/* Remove Student */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStudent(student.id, student.display_name || student.displayName || student.username);
                      }}
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 flex items-center gap-1"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
