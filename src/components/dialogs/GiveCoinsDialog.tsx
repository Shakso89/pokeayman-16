
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { awardCoinsToStudent } from "@/utils/pokemon/studentPokemon";
import { createCoinAwardNotification } from "@/utils/notificationService";

interface GiveCoinsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onCoinsAwarded?: () => void;
}

const GiveCoinsDialog: React.FC<GiveCoinsDialogProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onCoinsAwarded
}) => {
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (amount <= 0) {
        toast({
          title: "Error",
          description: "Amount must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      // Award coins to student
      awardCoinsToStudent(studentId, amount);

      // Create notification for student
      await createCoinAwardNotification(
        studentId,
        amount,
        reason || 'Great work!'
      );

      toast({
        title: "Success",
        description: `${amount} coins awarded to ${studentName}!`
      });

      // Reset form
      setAmount(10);
      setReason("");
      onCoinsAwarded?.();
      onClose();
    } catch (error) {
      console.error("Error awarding coins:", error);
      toast({
        title: "Error",
        description: "Failed to award coins",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Award Coins to {studentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max="1000"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you awarding these coins?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Awarding..." : `Award ${amount} Coins`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
