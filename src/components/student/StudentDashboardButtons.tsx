
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
  onShopClick: () => void;
  onHomeworkClick?: () => void;
}

const StudentDashboardButtons: React.FC<StudentDashboardButtonsProps> = ({
  coins,
  onMysteryBallClick,
  onCollectionClick,
  onShopClick,
  onHomeworkClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {/* Homework Button */}
      <Card 
        className="bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        onClick={onHomeworkClick}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img alt="Homework" src="/lovable-uploads/a6ec7163-286e-469d-bb28-6b749f788ebd.png" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("homework")}</h3>
              <p className="text-sm md:text-base text-white/80">{t("complete-assignments")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mystery Ball Button */}
      <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={onMysteryBallClick}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img alt="Mystery Ball" className="w-10 h-10 md:w-12 md:h-12" src="/lovable-uploads/925cb04e-51f5-4c9e-9575-d6611eb89ffd.png" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("mystery-ball")}</h3>
              <p className="text-sm md:text-base text-white/80">Win from 300 Pokémon!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Button */}
      <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={onCollectionClick}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <img src="/lovable-uploads/6643827c-343f-41b5-becf-e156015a18e7.png" alt="Collection" className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">{t("collection")}</h3>
              <p className="text-sm md:text-base text-white/80">{t("view-pokemon")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pokémon Shop Button */}
      <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={onShopClick}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">Pokémon Shop</h3>
              <p className="text-sm md:text-base text-white/80">Buy from 300 Pokémon!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardButtons;
