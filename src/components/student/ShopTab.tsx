
import React from 'react';
import PokemonShop from './PokemonShop';

interface ShopTabProps {
  studentId: string;
  studentCoins: number;
  onPurchaseComplete: () => void;
}

const ShopTab: React.FC<ShopTabProps> = ({
  studentId,
  studentCoins,
  onPurchaseComplete
}) => {
  return (
    <div className="space-y-6">
      <PokemonShop
        studentId={studentId}
        studentCoins={studentCoins}
        onPurchaseComplete={onPurchaseComplete}
      />
    </div>
  );
};

export default ShopTab;
