
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Package, Trophy, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentDashboardButtonsProps {
  coins: number;
  studentId: string;
  onMysteryBallClick: () => void;
  onCollectionClick: () => void;
}

const StudentDashboardButtons: React.FC<StudentDashboardButtonsProps> = ({
  coins,
  onMysteryBallClick,
  onCollectionClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {/* Homework Button */}
      <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/431ab8c1-ab7f-46cb-9baa-23f56a99d043.png" 
                alt="Homework" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("homework")}</h3>
              <p className="text-sm md:text-base text-white/80">{t("complete-assignments")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mystery Ball Button */}
      <Card 
        className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        onClick={onMysteryBallClick}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/3a4dc6ae-afe6-4fab-bde5-073d7f16e48a.png" 
                alt="Mystery Ball" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("mystery-ball")}</h3>
              <p className="text-sm md:text-base text-white/80">5 {t("coins")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Button */}
      <Card 
        className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        onClick={onCollectionClick}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" 
                alt="Collection" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("collection")}</h3>
              <p className="text-sm md:text-base text-white/80">{t("view-pokemon")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Arena Button */}
      <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/37428b9b-1c97-48af-9ecb-20160dc93ccf.png" 
                alt="Battle Arena" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("battle-arena")}</h3>
              <p className="text-sm md:text-base text-white/80">{t("compete-now")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardButtons;
