
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

interface GiveCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGiveCoins: (amount: number) => void;
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({ 
  open, 
  onOpenChange, 
  onGiveCoins 
}) => {
  const [coinAmount, setCoinAmount] = useState<number>(10);

  const handleGiveCoins = () => {
    onGiveCoins(coinAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give Coins to Student</DialogTitle>
          <DialogDescription>
            Enter the amount of coins to give to the student.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="coins">Coin Amount</Label>
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
            Cancel
          </Button>
          <Button onClick={handleGiveCoins}>
            Give Coins
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
