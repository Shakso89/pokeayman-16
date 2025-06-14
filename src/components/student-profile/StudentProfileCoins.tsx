
import React from "react";
import { Coins } from "lucide-react";

const StudentProfileCoins: React.FC<{ coins: number }> = ({ coins }) => (
  <div className="flex items-center bg-amber-50 p-4 rounded-lg gap-2 text-lg font-semibold">
    <Coins className="h-6 w-6 text-amber-500" />
    <span>Coin Balance:</span>
    <span className="text-amber-700 font-bold">{coins}</span>
  </div>
);

export default StudentProfileCoins;
