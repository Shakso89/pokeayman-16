
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface EmptyWheelStateProps {
  canRefresh: boolean;
  onRefreshWheel: () => void;
  coins: number;
}

const EmptyWheelState: React.FC<EmptyWheelStateProps> = ({ 
  canRefresh, 
  onRefreshWheel, 
  coins 
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="pokemon-card">
      <CardContent className="pt-6 text-center p-8">
        <p>{t("no-available-pokemon")}</p>
        {canRefresh && (
          <Button
            onClick={onRefreshWheel}
            className="mt-4"
            disabled={coins < 1}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh-wheel")} (1 {t("coin")})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyWheelState;
