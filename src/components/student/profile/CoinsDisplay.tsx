
import React from "react";
import { Coins } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface CoinsDisplayProps {
  coins: number;
  spentCoins: number;
}

const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ coins, spentCoins }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{t("current-coins")}:</p>
        <p className="text-xl font-bold text-amber-600 flex items-center">
          <Coins className="h-4 w-4 mr-1 text-amber-500" />
          {coins}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{t("spent-coins")}:</p>
        <p>{spentCoins}</p>
      </div>
    </div>
  );
};

export default CoinsDisplay;
