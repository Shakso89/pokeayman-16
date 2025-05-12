
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, History, BadgeDollarSign, Contact } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getTeacherCredits } from "@/utils/creditService";
import { TeacherCredit as TeacherCreditType, CreditTransaction } from "@/types/teacher";

interface TeacherCreditProps {
  teacherId: string;
}

const TeacherCredit: React.FC<TeacherCreditProps> = ({
  teacherId
}) => {
  const [creditData, setCreditData] = useState<TeacherCreditType | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load credit data for the teacher
    const teacherCreditData = getTeacherCredits(teacherId);
    setCreditData(teacherCreditData);

    // Filter transactions from the last 7 days
    if (teacherCreditData && teacherCreditData.transactionHistory) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recent = teacherCreditData.transactionHistory.filter(transaction => new Date(transaction.timestamp) >= oneWeekAgo).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentTransactions(recent);
    }
  }, [teacherId]);

  const handleRequestCredits = () => {
    navigate("/contact");
  };

  if (!creditData) {
    return <div className="flex justify-center items-center h-64">
        <p>{t("loading-credits") || "Loading credit information..."}</p>
      </div>;
  }

  return <div className="grid gap-6">
      {/* Current Credits Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-purple-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-500" />
            {t("available-credits") || "Available Credits"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-4xl font-bold text-center text-purple-600">
            {creditData.credits}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {t("total-used-credits") || "Total Used Credits"}: {creditData.usedCredits}
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-blue-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            {t("recent-transactions") || "Recent Transactions (7 Days)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {recentTransactions.length > 0 ? <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date") || "Date"}</TableHead>
                  <TableHead>{t("amount") || "Amount"}</TableHead>
                  <TableHead>{t("reason") || "Reason"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(transaction => <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={transaction.amount > 0 ? "bg-green-500" : "bg-red-500"}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.reason}</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table> : <p className="text-center text-gray-500">{t("no-recent-transactions") || "No transactions in the last 7 days"}</p>}
        </CardContent>
      </Card>

      {/* Credit Pricing Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-green-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-green-500" />
            {t("credit-pricing") || "Credit Pricing"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3">
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="font-semibold">Starter Pack</span>
                <div className="text-xs text-gray-500">500 {t("credits") || "Credits"}</div>
                <div className="text-xs text-gray-500">New teachers managing 1 small class</div>
              </div>
              <span className="font-bold">NT$99</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="font-semibold">Pro Pack</span>
                <div className="text-xs text-gray-500">1000 {t("credits") || "Credits"}</div>
                <div className="text-xs text-gray-500">Regular classroom use with rewards</div>
              </div>
              <span className="font-bold">NT$169</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="font-semibold">Elite Pack</span>
                <div className="text-xs text-gray-500">1500 {t("credits") || "Credits"}</div>
                <div className="text-xs text-gray-500">Teachers running multiple classes</div>
              </div>
              <span className="font-bold">NT$199</span>
            </div>
            <div className="flex justify-between">
              <div>
                <span className="font-semibold">Master Pack</span>
                <div className="text-xs text-gray-500">2000 {t("credits") || "Credits"}</div>
                <div className="text-xs text-gray-500">Schools or highly active teachers</div>
              </div>
              <span className="font-bold">NT$249</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRequestCredits} className="w-full bg-green-500 hover:bg-green-600">
            <Contact className="mr-2 h-4 w-4" />
            {t("request-more-credits") || "Request More Credits"}
          </Button>
        </CardFooter>
      </Card>
    </div>;
};

export default TeacherCredit;
