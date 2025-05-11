
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins } from "lucide-react";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentProfileProps {
  student: Student;
  coins: number;
  spentCoins: number;  // Added new prop
  pokemonCount: number;
  battlesCount: number;
  schoolRanking: number | null;  // Added new prop
  onGiveCoins: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  coins,
  spentCoins,
  pokemonCount,
  battlesCount,
  schoolRanking,
  onGiveCoins,
}) => {
  const { t } = useTranslation();
  const userType = localStorage.getItem("userType");
  
  return (
    <Card className="col-span-1 pokemon-card">
      <CardHeader>
        <CardTitle>{t("student-profile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Profile avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                {student.avatar ? (
                  <img 
                    src={student.avatar} 
                    alt={student.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500">
                      {student.displayName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">{t("display-name")}:</p>
            <p>{student.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("username")}:</p>
            <p>{student.username}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t("current-coins")}:</p>
              <p>{coins}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t("spent-coins")}:</p>
              <p>{spentCoins}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("pokemon-count")}:</p>
            <p>{pokemonCount}</p>
          </div>
          {schoolRanking && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t("school-ranking")}:</p>
              <p>#{schoolRanking}</p>
            </div>
          )}
          
          <Separator className="my-2" />
          
          {userType === "teacher" && (
            <div className="flex flex-col gap-2">
              <Button className="w-full flex items-center" onClick={onGiveCoins}>
                <Coins className="h-4 w-4 mr-2" />
                {t("give-coins")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
