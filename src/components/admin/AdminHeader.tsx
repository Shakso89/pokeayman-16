import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const AdminHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" aria-hidden="true" />
            <h1
              className="text-3xl font-bold"
              data-testid="admin-header-title"
            >
              {t("admin-dashboard") || "Admin Dashboard"}
            </h1>
          </div>
        </div>
        <p className="mt-2" data-testid="admin-header-description">
          {t("admin-dashboard-description") ||
            "Full system oversight and controls"}
        </p>
      </CardContent>
    </Card>
  );
};

export default memo(AdminHeader);
