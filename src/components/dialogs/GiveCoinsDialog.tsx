
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

interface GiveCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGiveCoins: (amount: number) => void;
  studentId: string; // Added this prop
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({ 
  open, 
  onOpenChange, 
  onGiveCoins,
  studentId // Added this prop to the destructuring
}) => {
  const { t } = useTranslation();
  const [coinAmount, setCoinAmount] = useState<number>(10);

  const handleGiveCoins = () => {
    onGiveCoins(coinAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("give-coins-to-student")}</DialogTitle>
          <DialogDescription>
            {t("give-coins-description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="coins">{t("coin-amount")}</Label>
            <Input
              id="coins"
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleGiveCoins}>
            {t("give-coins")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
