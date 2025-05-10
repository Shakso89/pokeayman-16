
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, Award } from "lucide-react";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentProfileProps {
  student: Student;
  coins: number;
  pokemonCount: number;
  battlesCount: number;
  onGiveCoins: () => void;
  onGivePokemon?: () => void;  // Added this prop with optional marker
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  coins,
  pokemonCount,
  battlesCount,
  onGiveCoins,
  onGivePokemon,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="col-span-1 pokemon-card">
      <CardHeader>
        <CardTitle>{t("student-profile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">{t("display-name")}:</p>
            <p>{student.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("username")}:</p>
            <p>{student.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("coins")}:</p>
            <p>{coins}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("pokemon-count")}:</p>
            <p>{pokemonCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("battles-participated")}:</p>
            <p>{battlesCount}</p>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex flex-col gap-2">
            <Button className="w-full flex items-center" onClick={onGiveCoins}>
              <Coins className="h-4 w-4 mr-2" />
              {t("give-coins")}
            </Button>
            
            {onGivePokemon && (
              <Button variant="outline" className="w-full flex items-center" onClick={onGivePokemon}>
                <Award className="h-4 w-4 mr-2" />
                {t("give-pokemon")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
