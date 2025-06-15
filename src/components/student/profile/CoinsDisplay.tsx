
import React from "react";
import { Coins } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useStudentCoinData } from "@/hooks/useStudentCoinData";

interface CoinsDisplayProps {
  studentId: string;
}

const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ studentId }) => {
  const { t } = useTranslation();
  const { coins, spent_coins, isLoading } = useStudentCoinData(studentId);

  if (isLoading) {
    return (
      <div className="flex justify-between animate-pulse">
        <div>
          <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    );
  }

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
        <p>{spent_coins}</p>
      </div>
    </div>
  );
};

export default CoinsDisplay;
