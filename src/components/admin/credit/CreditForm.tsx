
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TeacherCredit } from "@/types/teacher";
import { useTranslation } from "@/hooks/useTranslation";

interface CreditFormProps {
  teacher: TeacherCredit;
  onAddCredits: (amount: number, reason: string) => Promise<void>;
}

const CreditForm: React.FC<CreditFormProps> = ({ teacher, onAddCredits }) => {
  const { t } = useTranslation();
  const [creditAmount, setCreditAmount] = useState(50);
  const [reason, setReason] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCredits(creditAmount, reason);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle>{teacher.username}</CardTitle>
        <p className="text-sm text-gray-500">
          {t("available-credits") || "Available Credits"}: {teacher.credits}
        </p>
        <p className="text-sm text-gray-500">
          {t("used-credits") || "Used Credits"}: {teacher.usedCredits}
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="amount">{t("credit-amount") || "Credit Amount"}</Label>
            <Input
              id="amount"
              type="number"
              value={creditAmount}
              min="1"
              onChange={(e) => setCreditAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="reason">{t("reason") || "Reason"}</Label>
            <Input
              id="reason"
              value={reason}
              placeholder="e.g., Monthly subscription"
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            {t("add-credits") || "Add Credits"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditForm;
