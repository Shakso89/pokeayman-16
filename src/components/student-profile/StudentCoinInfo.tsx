
import React from "react";
import { Coins } from "lucide-react";
import { useStudentCoinData } from "@/hooks/useStudentCoinData";

interface StudentCoinInfoProps {
  studentId: string;
}

export const StudentCoinInfo: React.FC<StudentCoinInfoProps> = ({ studentId }) => {
  const { coins, spent_coins, isLoading } = useStudentCoinData(studentId);
  
  if (isLoading) {
    return (
      <div className="mt-2 p-3 bg-amber-50 rounded-md animate-pulse">
        <div className="h-4 bg-amber-200 rounded mb-2"></div>
        <div className="h-6 bg-amber-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="mt-2 p-3 bg-amber-50 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-amber-800">Coin Balance</p>
          <p className="text-xl font-bold text-amber-600 flex items-center">
            <Coins className="h-4 w-4 mr-1 text-amber-500" />
            {coins}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Spent Coins</p>
          <p className="text-md text-amber-700 text-right">{spent_coins}</p>
        </div>
      </div>
    </div>
  );
};
