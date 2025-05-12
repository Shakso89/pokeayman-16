
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherCredit, CreditTransaction } from "@/types/teacher";
import { useTranslation } from "@/hooks/useTranslation";

interface TransactionHistoryProps {
  teacher: TeacherCredit;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ teacher }) => {
  const { t } = useTranslation();
  
  if (!teacher.transactionHistory || teacher.transactionHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("transaction-history") || "Transaction History"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">{t("no-transactions") || "No transactions found"}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("transaction-history") || "Transaction History"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date") || "Date"}</TableHead>
              <TableHead>{t("amount") || "Amount"}</TableHead>
              <TableHead>{t("reason") || "Reason"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacher.transactionHistory
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={transaction.amount > 0 ? "bg-green-500" : "bg-red-500"}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
