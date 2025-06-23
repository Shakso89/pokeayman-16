
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnifiedMysteryBall from "./UnifiedMysteryBall";
import { useStudentData } from "@/hooks/useStudentData";

interface UnifiedMysteryBallTabProps {
  studentId: string;
  onDataUpdate?: () => void;
}

const UnifiedMysteryBallTab: React.FC<UnifiedMysteryBallTabProps> = ({ 
  studentId, 
  onDataUpdate 
}) => {
  const { refreshStudentData } = useStudentData(studentId);

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
          <CardTitle className="text-center">🎯 Daily Mystery Ball</CardTitle>
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
          <CardTitle className="text-lg">How Mystery Ball Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">🎁 What You Can Win:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 70% chance: Random Pokémon</li>
                  <li>• 30% chance: 5-20 coins</li>
                  <li>• All from the unified 300 Pokémon pool</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">⏰ Usage Rules:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• One free attempt per day</li>
                  <li>• Resets at midnight</li>
                  <li>• No limit on collected Pokémon</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-xs">
                <strong>Tip:</strong> The mystery ball draws from the same global pool of 300 unique Pokémon 
                that all students and teachers share. You can collect the same Pokémon multiple times!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBallTab;
