
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

interface RemoveCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveCoins: (amount: number) => void;
  studentId: string;
  studentName: string;
}

const RemoveCoinsDialog: React.FC<RemoveCoinsDialogProps> = ({ 
  open, 
  onOpenChange, 
  onRemoveCoins,
  studentId,
  studentName
}) => {
  const { t } = useTranslation();
  const [coinAmount, setCoinAmount] = useState<number>(5);

  const handleRemoveCoins = () => {
    onRemoveCoins(coinAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("remove-coins-from-student")}</DialogTitle>
          <DialogDescription>
            Remove coins from {studentName}
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
          <Button variant="destructive" onClick={handleRemoveCoins}>
            {t("remove-coins")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCoinsDialog;
