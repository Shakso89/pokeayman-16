
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { awardCoinsToStudent } from "@/services/studentCoinService";

interface GiveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  onGiveCoins: (amount: number) => void;
  teacherId: string;
  classId: string;
  schoolId?: string;
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({
  isOpen,
  onOpenChange,
  studentName,
  studentId,
  onGiveCoins,
  teacherId,
  classId,
  schoolId,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const coinAmount = parseInt(amount);
    if (coinAmount > 0) {
      setIsLoading(true);
      try {
        console.log("Awarding coins:", { 
          studentId, 
          studentName, 
          coinAmount, 
          teacherId, 
          classId, 
          schoolId 
        });
        
        const success = await awardCoinsToStudent(studentId, coinAmount);
        
        if (success) {
          toast({
            title: t("success"),
            description: `${coinAmount} coins awarded to ${studentName}`
          });

          onGiveCoins(coinAmount);
          setAmount("");
          onOpenChange(false);
        } else {
          throw new Error("Failed to award coins - check student ID and database connection");
        }
      } catch (error) {
        console.error("Error awarding coins:", error);
        toast({
          title: t("error"),
          description: `Failed to award coins: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("give-coins")} - {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Student ID: {studentId}</p>
            <p>Class ID: {classId}</p>
            {schoolId && <p>School ID: {schoolId}</p>}
          </div>
          
          <div>
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!amount || parseInt(amount) <= 0 || isLoading}
          >
            {isLoading ? "Awarding..." : t("give-coins")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
