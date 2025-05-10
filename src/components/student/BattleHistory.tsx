
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

interface BattleHistoryProps {
  battles: any[];
  studentId: string;
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ battles, studentId }) => {
  const { t } = useTranslation();

  if (battles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("no-battles-yet")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {battles.map((battle) => (
        <div key={battle.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{battle.name}</h3>
              <p className="text-sm text-gray-500">{battle.description}</p>
            </div>
            <div className="px-2 py-1 text-xs rounded-full capitalize" 
              style={{ 
                backgroundColor: battle.status === 'completed' ? '#D1FAE5' : 
                                battle.status === 'active' ? '#DBEAFE' : '#FEF3C7',
                color: battle.status === 'completed' ? '#065F46' : 
                        battle.status === 'active' ? '#1E40AF' : '#9A3412'
              }}
            >
              {battle.status}
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <p>
              <span className="text-gray-500">{t("reward")}: </span>
              {battle.baseReward} {t("coins")}
            </p>
            
            {battle.status === 'completed' && battle.winner?.studentId === studentId && (
              <p className="text-green-600 font-medium">{t("winner")}</p>
            )}
            
            {battle.status === 'completed' && battle.winner?.studentId !== studentId && (
              <p className="text-gray-500">{t("participated")}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BattleHistory;
