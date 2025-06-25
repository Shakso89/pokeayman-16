
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
          <CardTitle className="text-center">🌍 Site-Wide Mystery Pokéball</CardTitle>
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
          <CardTitle className="text-lg">How Site-Wide Mystery Pokéball Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">🎁 What You Can Win:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 50% chance: Random Pokémon from the shared site pool</li>
                  <li>• 50% chance: 1-20 coins</li>
                  <li>• All Pokémon from our universal collection</li>
                  <li>• Same pool shared across all schools</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">💰 Pricing:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 10 coins per use</li>
                  <li>• No daily limits</li>
                  <li>• Use as many times as you can afford</li>
                  <li>• Pool never gets depleted</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-xs">
                <strong>Site-Wide Pool:</strong> The mystery Pokéball draws from our shared site-wide Pokemon pool! 
                This means you can win any Pokemon from our complete collection, and the pool is never depleted - 
                it's shared across all schools and students.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBallTab;
