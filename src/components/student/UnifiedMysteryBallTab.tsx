
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnifiedMysteryBall from "./UnifiedMysteryBall";
import { useStudentDataRefresh } from "@/hooks/useStudentDataRefresh";

interface UnifiedMysteryBallTabProps {
  studentId: string;
  onDataUpdate?: () => void;
}

const UnifiedMysteryBallTab: React.FC<UnifiedMysteryBallTabProps> = ({ 
  studentId, 
  onDataUpdate 
}) => {
  const { refreshStudentData } = useStudentDataRefresh(studentId);

  const handlePokemonWon = () => {
    if (onDataUpdate) {
      onDataUpdate();
    }
    refreshStudentData();
  };

  const handleCoinsWon = () => {
    if (onDataUpdate) {
      onDataUpdate();
    }
    refreshStudentData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">🎯 Mystery Pokéball</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <UnifiedMysteryBall
              studentId={studentId}
              onPokemonWon={handlePokemonWon}
              onCoinsWon={handleCoinsWon}
            />
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Mystery Pokéball Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">🎁 What You Can Win:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 50% chance: Random Pokémon from the global pool</li>
                  <li>• 50% chance: 1-20 coins</li>
                  <li>• All Pokémon from the unified collection</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">💰 Pricing:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 10 coins per use</li>
                  <li>• No daily limits</li>
                  <li>• Use as many times as you can afford</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-xs">
                <strong>Updated:</strong> The mystery Pokéball now costs 10 coins per use and gives you either 1-20 coins or a random Pokémon from our collection of 300+ unique Pokémon!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBallTab;
