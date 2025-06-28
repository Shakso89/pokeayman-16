
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedGiveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export const EnhancedGiveCoinsDialog: React.FC<EnhancedGiveCoinsDialogProps> = ({
  isOpen,
  onOpenChange,
  studentId,
  studentName,
  onSuccess
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("10");
  const [reason, setReason] = useState<string>("Manual award");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);

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
    setDebugInfo("");

    try {
      // Capture console logs for debugging
      const originalLog = console.log;
      const originalError = console.error;
      let debugLogs: string[] = [];

      console.log = (...args) => {
        debugLogs.push(`LOG: ${args.join(' ')}`);
        originalLog(...args);
      };

      console.error = (...args) => {
        debugLogs.push(`ERROR: ${args.join(' ')}`);
        originalError(...args);
      };

      console.log("🚀 Starting enhanced coin award process");
      console.log("Student ID:", studentId);
      console.log("Student Name:", studentName);
      console.log("Amount:", coinAmount);
      console.log("Reason:", reason);

      const result = await awardCoinsToStudentEnhanced(
        studentId,
        coinAmount,
        reason,
        "manual_award"
      );

      // Restore console functions
      console.log = originalLog;
      console.error = originalError;

      // Set debug info
      setDebugInfo(debugLogs.join('\n'));

      if (result.success) {
        toast({
          title: "Success!",
          description: `${coinAmount} coins awarded to ${studentName}. New balance: ${result.newBalance}`,
        });
        
        onSuccess();
        onOpenChange(false);
        setAmount("10");
        setReason("Manual award");
      } else {
        toast({
          title: "Failed to Award Coins",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
        setShowDebug(true);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setShowDebug(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Award Coins to {studentName}</DialogTitle>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you awarding these coins?"
              rows={3}
            />
          </div>

          {showDebug && debugInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <details>
                  <summary className="cursor-pointer font-medium">Debug Information</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {debugInfo}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}

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
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Award Coins
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
