
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Loader2 } from "lucide-react";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";
import { useToast } from "@/hooks/use-toast";

interface GiveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  teacherId: string;
  classId: string;
  schoolId: string;
  onGiveCoins: (amount: number) => void;
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({
  isOpen,
  onOpenChange,
  studentName,
  studentId,
  teacherId,
  classId,
  schoolId,
  onGiveCoins
}) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGiveCoins = async () => {
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

    setIsLoading(true);
    try {
      console.log("🎁 Awarding coins with enhanced service:", {
        studentId,
        amount: coinAmount,
        reason: reason || "Teacher award",
        teacherId,
        classId,
        schoolId
      });

      const result = await awardCoinsToStudentEnhanced(
        studentId,
        coinAmount,
        reason || "Teacher award",
        "teacher_award",
        classId,
        schoolId
      );

      if (result.success) {
        toast({
          title: "Success! 🎉",
          description: `${coinAmount} coins awarded to ${studentName}. New balance: ${result.newBalance} coins`,
        });
        
        onGiveCoins(coinAmount);
        setAmount("");
        setReason("");
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to award coins",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Error in GiveCoinsDialog:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Award Coins to {studentName}
          </DialogTitle>
          <DialogDescription>
            Give coins to reward good behavior, completed homework, or achievements.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={handleAmountChange}
              className="col-span-3"
              maxLength={4}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="reason" className="text-right pt-2">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Why are you giving these coins? (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              rows={3}
              maxLength={200}
            />
          </div>
          
          {amount && (
            <div className="text-sm text-gray-600 ml-auto">
              Preview: {studentName} will receive {amount} coins
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGiveCoins}
            disabled={!amount || isLoading}
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
                Award {amount || "0"} Coins
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
