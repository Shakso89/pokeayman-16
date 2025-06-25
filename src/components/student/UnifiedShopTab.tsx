
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnifiedPokemonShop from "./UnifiedPokemonShop";
import { useStudentDataRefresh } from "@/hooks/useStudentDataRefresh";

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
  const { refreshStudentData } = useStudentDataRefresh(studentId);

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
          <CardTitle className="text-lg">Site-Wide Shop Information</CardTitle>
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
                  <li>• Instant delivery to your collection</li>
                  <li>• All Pokemon from site-wide pool available</li>
                  <li>• Pool shared across all schools</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-xs">
                <strong>Site-Wide System:</strong> Our shop features the complete site-wide Pokemon pool shared across all schools! 
                You can purchase any Pokemon multiple times - each purchase adds a copy to your personal collection while 
                the original stays in the shared pool for everyone to access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedShopTab;
