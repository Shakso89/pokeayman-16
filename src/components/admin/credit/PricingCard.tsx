
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

const PricingCard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("credit-pricing") || "Credit Pricing"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p>• Create a student account: 5 credits</p>
          <p>• Assign homework: 5 credits</p>
          <p>• Approve homework: Credits equal to coin reward</p>
          <p>• Award coins manually: 1 credit per coin</p>
          <p>• Delete a Pokémon: 2 credits</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
