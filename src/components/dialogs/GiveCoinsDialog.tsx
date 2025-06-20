
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";
import { Loader2, Coins } from "lucide-react";

interface GiveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onGiveCoins: (amount: number) => void;
  teacherId: string;
  classId: string;
  schoolId?: string;
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({
  isOpen,
  onOpenChange,
  studentId,
  studentName,
  onGiveCoins,
  teacherId,
  classId,
  schoolId
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("10");
  const [reason, setReason] = useState<string>("Teacher reward");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const coinAmount = parseInt(amount);
    if (!coinAmount || coinAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🎯 Awarding coins via GiveCoinsDialog", {
        studentId,
        studentName,
        amount: coinAmount,
        reason,
        teacherId,
        classId
      });

      const result = await awardCoinsToStudentEnhanced(
        studentId,
        coinAmount,
        reason,
        "teacher_award",
        classId
      );

      if (result.success) {
        toast({
          title: "Success!",
          description: `${coinAmount} coins awarded to ${studentName}`,
        });
        
        onGiveCoins(coinAmount);
        onOpenChange(false);
        setAmount("10");
        setReason("Teacher reward");
      } else {
        console.error("Failed to award coins:", result.error);
        toast({
          title: "Failed to Award Coins",
          description: result.error || "Please check the console for details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Unexpected error awarding coins:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Award Coins to {studentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="1000"
              required
              className="text-center text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you awarding these coins?"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Awarding...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Award {amount} Coins
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
