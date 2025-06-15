
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/services/activityLogger";

interface RemoveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  onRemoveCoins: (amount: number) => void;
  teacherId: string;
  classId: string;
  schoolId?: string;
}

const RemoveCoinsDialog: React.FC<RemoveCoinsDialogProps> = ({
  isOpen,
  onOpenChange,
  studentName,
  studentId,
  onRemoveCoins,
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
        // Get current coins and check if student has enough
        const { data: currentProfile } = await supabase
          .from('student_profiles')
          .select('coins, spent_coins')
          .eq('user_id', studentId)
          .maybeSingle();

        if (currentProfile && currentProfile.coins >= coinAmount) {
          const { error } = await supabase
            .from('student_profiles')
            .update({ 
              coins: currentProfile.coins - coinAmount,
              spent_coins: (currentProfile.spent_coins || 0) + coinAmount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', studentId);

          if (error) throw error;

          toast({
            title: t("success"),
            description: `${coinAmount} coins removed from ${studentName}`
          });
          
          await logActivity(
            teacherId,
            'removed_coins',
            { studentId, studentName, amount: coinAmount, classId, schoolId }
          );

          onRemoveCoins(coinAmount);
          setAmount("");
          onOpenChange(false);
        } else {
          toast({
            title: t("error"),
            description: "Student doesn't have enough coins",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error removing coins:", error);
        toast({
          title: t("error"),
          description: "Failed to remove coins",
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
          <DialogTitle>{t("remove-coins")} - {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
            {isLoading ? "Removing..." : t("remove-coins")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCoinsDialog;
