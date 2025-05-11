
import React, { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { getStudentPokemons } from "@/utils/pokemon/storage";

interface StudentCoinInfoProps {
  studentId: string;
}

export const StudentCoinInfo: React.FC<StudentCoinInfoProps> = ({ studentId }) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  
  useEffect(() => {
    if (studentId) {
      loadStudentCoins();
    }
  }, [studentId]);
  
  const loadStudentCoins = () => {
    try {
      const studentPokemons = getStudentPokemons();
      const studentData = studentPokemons.find(sp => sp.studentId === studentId);
      
      if (studentData) {
        setCoinBalance(studentData.coins || 0);
        
        // Check if spentCoins exists, if not calculate it or set to 0
        if (studentData.spentCoins !== undefined) {
          setSpentCoins(studentData.spentCoins);
        } else {
          // Default to 0 since spentCoins property doesn't exist in the type
          setSpentCoins(0);
        }
      }
    } catch (error) {
      console.error("Error loading student coins:", error);
    }
  };
  
  return (
    <div className="mt-2 p-3 bg-amber-50 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-amber-800">Coin Balance</p>
          <p className="text-xl font-bold text-amber-600 flex items-center">
            <Coins className="h-4 w-4 mr-1 text-amber-500" />
            {coinBalance}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Spent Coins</p>
          <p className="text-md text-amber-700 text-right">{spentCoins}</p>
        </div>
      </div>
    </div>
  );
};
