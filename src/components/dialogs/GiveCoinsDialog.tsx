
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
        // Find student's profile via username to bridge legacy student ID and user_id
        const { data: studentLegacy, error: legacyError } = await supabase
          .from('students')
          .select('username')
          .eq('id', studentId) // studentId is legacy ID from 'students' table
          .maybeSingle();

        if (legacyError || !studentLegacy) throw new Error("Legacy student record not found.");

        const { data: currentProfile, error: profileError } = await supabase
          .from('student_profiles')
          .select('user_id, coins')
          .eq('username', studentLegacy.username)
          .maybeSingle();

        if (profileError || !currentProfile) throw new Error("Student profile not found.");

        const { error } = await supabase
          .from('student_profiles')
          .update({
            coins: currentProfile.coins + coinAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentProfile.user_id);

        if (error) throw error;

        toast({
          title: t("success"),
          description: `${coinAmount} coins awarded to ${studentName}`
        });

        onGiveCoins(coinAmount);

        setAmount("");
        onOpenChange(false);
      } catch (error) {
        console.error("Error awarding coins:", error);
        toast({
          title: t("error"),
          description: "Failed to award coins.",
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
