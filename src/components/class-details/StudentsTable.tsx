import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Coins, Award, UserMinus, Minus, MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/services/studentCoinService";
import { useStudentCoinData } from "@/hooks/useStudentCoinData";

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

const StudentRow: React.FC<{
  student: any;
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins?: (studentId: string, studentName: string) => void;
  onRemovePokemon?: (studentId: string, studentName: string) => void;
  classData: any;
  navigate: (path: string) => void;
}> = ({
  student,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData,
  navigate
}) => {
  const { coins, pokemonCount, refreshData } = useStudentCoinData(student.id);

  const handleStudentClick = () => {
    navigate(`/student-detail/${student.id}`);
  };

  const handleAwardCoins = async () => {
    const success = await awardCoinsToStudent(student.id, 10);
    if (success) {
      toast.success(`10 coins awarded to ${student.display_name || student.displayName || student.username}`);
      refreshData();
    } else {
      toast.error("Failed to award coins");
    }
  };

  const handleRemoveCoins = async () => {
    const success = await removeCoinsFromStudent(student.id, 5);
    if (success) {
      toast.success(`5 coins removed from ${student.display_name || student.displayName || student.username}`);
      refreshData();
    } else {
      toast.error("Failed to remove coins or insufficient coins");
    }
  };

  const displayName = student.display_name || student.displayName || student.username;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div 
        className="flex items-center space-x-4 cursor-pointer flex-1"
        onClick={handleStudentClick}
      >
        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
          {displayName.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 hover:text-blue-600">
            {displayName}
          </p>
          <p className="text-sm text-gray-500">@{student.username}</p>
          <div className="flex items-center gap-4 text-sm mt-1">
            <span className="flex items-center gap-1 text-yellow-600 font-medium">
              💰 {coins} coins
            </span>
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              🎮 {pokemonCount} pokemon
            </span>
          </div>
        </div>
      </div>

      {isClassCreator && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAwardCoins();
            }}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex items-center gap-1"
          >
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Award Coin</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleRemoveCoins}>
                <Minus className="mr-2 h-4 w-4" />
                <span>Remove Coin</span>
              </DropdownMenuItem>
              {onRemovePokemon && (
                <DropdownMenuItem onClick={() => onRemovePokemon(student.id, displayName)}>
                  <Minus className="mr-2 h-4 w-4" />
                  <span>Pokémon</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onRemoveStudent(student.id, displayName)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Remove Student</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

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
              <StudentRow
                key={student.id}
                student={student}
                isClassCreator={isClassCreator}
                onAwardCoins={onAwardCoins}
                onManagePokemon={onManagePokemon}
                onRemoveStudent={onRemoveStudent}
                onRemoveCoins={onRemoveCoins}
                onRemovePokemon={onRemovePokemon}
                classData={classData}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
