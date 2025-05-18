
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { AdminTeacherData } from "./TeachersTab";

interface TeacherCardProps {
  teacher: AdminTeacherData;
  processing: 'toggle' | 'delete' | null;
  t: (key: string, fallback?: string) => string;
  onToggle: () => void;
  onDelete: () => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  processing,
  t,
  onToggle,
  onDelete,
}) => {
  const isAdmin = teacher.username === "Admin" || teacher.username === "Ayman";

  return (
    <Card className="relative">
      {isAdmin && (
        <div className="absolute top-0 right-0 m-2">
          <Badge className="bg-purple-500">
            {t("admin-account") || "Admin Account"}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{teacher.displayName} ({teacher.username})</span>
          <Badge className={teacher.isActive ? "bg-green-500" : "bg-red-500"}>
            {teacher.isActive ? t("active") || "Active" : t("frozen") || "Frozen"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">{t("account-type")}</p>
            <p>{teacher.subscriptionType || t("none")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("expiry-date")}</p>
            <p>{teacher.expiryDate || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("created")}</p>
            <p>{new Date(teacher.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("last-login")}</p>
            <p>{teacher.lastLogin || t("no-login")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("time-spent")}</p>
            <p>{teacher.timeSpent ?? 0} {t("minutes")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("classes")}</p>
            <p>{teacher.numSchools ?? 0} {t("schools")}, {teacher.numStudents ?? 0} {t("students")}</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={onToggle}
              variant={teacher.isActive ? "destructive" : "default"}
              disabled={!!processing}
            >
              {processing === 'toggle' ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("processing")}</>
              ) : (
                teacher.isActive ? t("freeze-account") : t("unfreeze-account")
              )}
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50"
              disabled={!!processing}
            >
              {processing === 'delete' ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("processing")}</>
              ) : (
                t("delete-account")
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
