
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Coins, Award, Trash2, UserMinus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentsTableProps {
  students: any[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onAddStudent: () => void;
  classData: any;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onAddStudent,
  classData
}) => {
  const { t } = useTranslation();

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
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                    {(student.display_name || student.displayName || student.username || '')
                      .substring(0, 1)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {student.display_name || student.displayName || student.username}
                    </p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>💰 {student.coins || 0} coins</span>
                      <span>🎮 {student.pokemonCount || 0} pokemon</span>
                    </div>
                  </div>
                </div>

                {isClassCreator && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAwardCoins(student.id, student.display_name || student.displayName || student.username)}
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <Coins className="h-4 w-4 mr-1" />
                      Award Coins
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onManagePokemon(
                        student.id, 
                        student.display_name || student.displayName || student.username,
                        student.schoolId || classData?.school_id || ''
                      )}
                      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Manage Pokemon
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveStudent(student.id, student.display_name || student.displayName || student.username)}
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Remove
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
