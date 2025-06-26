
import React from 'react';
import UnifiedShopTab from './UnifiedShopTab';

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
      <UnifiedShopTab
        studentId={studentId}
        studentCoins={studentCoins}
        onDataUpdate={onPurchaseComplete}
      />
    </div>
  );
};

export default ShopTab;
