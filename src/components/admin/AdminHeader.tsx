
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface AdminHeaderProps {
  t: (key: string, fallback?: string) => string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ t }) => {
  return (
    <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <h1 className="text-3xl font-bold">{t("admin-dashboard")}</h1>
          </div>
        </div>
        <p className="mt-2">{t("admin-dashboard-description") || "Full system oversight and controls"}</p>
      </CardContent>
    </Card>
  );
};

export default AdminHeader;
