
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnifiedPokemonShop from "./UnifiedPokemonShop";
import { useStudentData } from "@/hooks/useStudentData";

interface UnifiedShopTabProps {
  studentId: string;
  studentCoins: number;
  onDataUpdate?: () => void;
}

const UnifiedShopTab: React.FC<UnifiedShopTabProps> = ({ 
  studentId, 
  studentCoins,
  onDataUpdate 
}) => {
  const { refreshStudentData } = useStudentData(studentId);

  const handlePurchase = () => {
    if (onDataUpdate) {
      onDataUpdate();
    }
    refreshStudentData();
  };

  return (
    <div className="space-y-6">
      <UnifiedPokemonShop
        studentId={studentId}
        studentCoins={studentCoins}
        onPurchase={handlePurchase}
      />

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shop Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">💰 Pricing:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Common: 5-15 coins</li>
                  <li>• Uncommon: 15-25 coins</li>
                  <li>• Rare: 25-50 coins</li>
                  <li>• Legendary: 100+ coins</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">🛍️ Purchase Rules:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Buy any Pokémon multiple times</li>
                  <li>• Instant delivery to collection</li>
                  <li>• All 300 Pokémon available</li>
                  <li>• Earn coins from activities</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-xs">
                <strong>New System:</strong> The shop now features the complete unified pool of 300 Pokémon! 
                You can purchase any Pokémon multiple times to build your ultimate collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedShopTab;
