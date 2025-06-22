
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
    
    console.log("🎯 Starting coin award process", {
      studentId,
      studentName,
      amount,
      reason,
      teacherId,
      classId,
      schoolId
    });

    // Validate amount
    const coinAmount = parseInt(amount);
    if (!coinAmount || coinAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    if (coinAmount > 1000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum 1000 coins can be awarded at once",
        variant: "destructive"
      });
      return;
    }

    // Validate student ID
    if (!studentId || studentId === 'undefined' || studentId.trim() === '') {
      console.error("❌ Invalid student ID:", studentId);
      toast({
        title: "Error",
        description: "Invalid student ID - please try refreshing the page",
        variant: "destructive"
      });
      return;
    }

    // Validate reason
    if (!reason || reason.trim() === '') {
      setReason("Teacher reward");
    }

    setIsLoading(true);

    try {
      console.log("🎯 Awarding coins via GiveCoinsDialog", {
        studentId,
        studentName,
        amount: coinAmount,
        reason: reason.trim(),
        teacherId,
        classId,
        schoolId
      });

      const result = await awardCoinsToStudentEnhanced(
        studentId,
        coinAmount,
        reason.trim(),
        "teacher_award",
        classId,
        schoolId
      );

      console.log("🎯 Coin award result:", result);

      if (result.success) {
        toast({
          title: "Success!",
          description: `Awarded ${coinAmount} coins to ${studentName}. New balance: ${result.newBalance || 'Unknown'}`,
        });
        
        onGiveCoins(coinAmount);
        onOpenChange(false);
        
        // Reset form
        setAmount("10");
        setReason("Teacher reward");
      } else {
        const errorMessage = result.error || "Failed to award coins - unknown error";
        console.error("❌ Coin award failed:", errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Unexpected error awarding coins:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      toast({
        title: "Error",
        description: `Failed to award coins: ${errorMessage}`,
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
            Give Coins to {studentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter coin amount"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for awarding coins"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || parseInt(amount) <= 0}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Awarding...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Give {amount} Coins
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
