import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Coins, Award, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { useStudentCoinData } from "@/hooks/useStudentCoinData";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/services/studentCoinService";

interface Student {
  id: string;
  username: string;
  displayName?: string;
  display_name?: string;
  avatar?: string;
  schoolId?: string;
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

const StudentCard: React.FC<{
  student: Student;
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  classData: any;
}> = ({
  student,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  classData,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { coins, pokemonCount, refreshData } = useStudentCoinData(student.id);

  const displayName = student.displayName || student.display_name || student.username;

  const handleViewProfile = () => {
    navigate(`/student-profile/${student.id}`);
  };

  const handleAwardCoins = async () => {
    const success = await awardCoinsToStudent(student.id, 10);
    if (success) {
      toast({
        title: t("success"),
        description: `10 coins awarded to ${displayName}`
      });
      refreshData();
    } else {
      toast({
        title: t("error"),
        description: "Failed to award coins",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoins = async () => {
    const success = await removeCoinsFromStudent(student.id, 5);
    if (success) {
      toast({
        title: t("success"),
        description: `5 coins removed from ${displayName}`
      });
      refreshData();
    } else {
      toast({
        title: t("error"),
        description: "Failed to remove coins or insufficient coins",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRandomPokemon = async () => {
    toast({
      title: "Action moved",
      description: 'Please use the "Manage Pokemon" dialog to remove a specific Pokemon.',
    });
  };

  return (
    <Card 
      className="bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
      onClick={handleViewProfile}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatar} alt={displayName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm text-gray-600">@{student.username}</p>
          </div>

          <div className="flex space-x-4 w-full">
            <div className="flex-1 bg-yellow-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center space-x-1 text-yellow-700">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">Coins</span>
              </div>
              <p className="text-xl font-bold text-yellow-800">{coins}</p>
            </div>
            
            <div className="flex-1 bg-purple-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-700">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Pokemon</span>
              </div>
              <p className="text-xl font-bold text-purple-800">{pokemonCount}</p>
            </div>
          </div>

          {isClassCreator && (
            <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-white/20 mt-4">
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={(e) => { e.stopPropagation(); handleAwardCoins(); }}
              >
                <Coins className="h-4 w-4 mr-1" />
                Coins
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => { e.stopPropagation(); handleRemoveCoins(); }}
              >
                <Minus className="h-4 w-4 mr-1" />
                Coins 
              </Button>

              <Button 
                size="sm" 
                variant="destructive" 
                onClick={(e) => { e.stopPropagation(); onRemoveStudent(student.id, displayName); }}
                className="col-span-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("remove-student")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
  const { t } = useTranslation();

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("no-students-in-class")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            isClassCreator={isClassCreator}
            onAwardCoins={onAwardCoins}
            onManagePokemon={onManagePokemon}
            onRemoveStudent={onRemoveStudent}
            onRemoveCoins={onRemoveCoins}
            classData={classData}
          />
        ))}
      </div>
    </>
  );
};

export default StudentsGrid;
