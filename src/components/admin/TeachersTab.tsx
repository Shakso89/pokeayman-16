
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Renaming the interface to avoid conflicts with AdminDashboard
export interface AdminTeacherData {
  id: string;
  username: string;
  displayName: string;
  schools?: string[];
  students?: string[];
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number;
  expiryDate?: string;
  subscriptionType?: "trial" | "monthly" | "annual";
  isActive: boolean;
  numSchools?: number;
  numStudents?: number;
}

interface TeachersTabProps {
  teachers: AdminTeacherData[];
  setTeachers: React.Dispatch<React.SetStateAction<AdminTeacherData[]>>;
  t: (key: string, fallback?: string) => string;
}

const TeachersTab: React.FC<TeachersTabProps> = ({ teachers, setTeachers, t }) => {
  const handleToggleAccount = (userId: string) => {
    const updatedTeachers = teachers.map(teacher => {
      if (teacher.id === userId) {
        const newIsActive = !teacher.isActive;
        return {
          ...teacher,
          isActive: newIsActive
        };
      }
      return teacher;
    });
    setTeachers(updatedTeachers);
    localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
    toast({
      title: "Teacher account updated",
      description: `Teacher account has been ${updatedTeachers.find(t => t.id === userId)?.isActive ? "activated" : "frozen"}`
    });
  };

  const handleDeleteAccount = (userId: string) => {
    const filteredTeachers = teachers.filter(teacher => teacher.id !== userId);
    setTeachers(filteredTeachers);
    localStorage.setItem("teachers", JSON.stringify(filteredTeachers));
    toast({
      title: "Teacher account deleted",
      description: "Teacher account has been permanently deleted"
    });
  };

  return (
    <div className="grid gap-4">
      {teachers.map(teacher => (
        <Card key={teacher.id} className="relative">
          {(teacher.username === "Admin" || teacher.username === "Ayman") && (
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
                <p className="text-sm text-gray-500">{t("account-type") || "Account Type"}</p>
                <p>{teacher.subscriptionType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("expiry-date") || "Expiry Date"}</p>
                <p>{teacher.expiryDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("created") || "Created"}</p>
                <p>{new Date(teacher.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("last-login") || "Last Login"}</p>
                <p>{teacher.lastLogin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("time-spent") || "Time Spent"}</p>
                <p>{teacher.timeSpent} {t("minutes") || "minutes"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("classes") || "Classes"}</p>
                <p>{teacher.numSchools} {t("schools") || "schools"}, {teacher.numStudents} {t("students") || "students"}</p>
              </div>
            </div>
            
            {(teacher.username !== "Admin" && teacher.username !== "Ayman") && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleToggleAccount(teacher.id)} 
                  variant={teacher.isActive ? "destructive" : "default"}
                >
                  {teacher.isActive ? t("freeze-account") || "Freeze Account" : t("unfreeze-account") || "Unfreeze Account"}
                </Button>
                <Button 
                  onClick={() => handleDeleteAccount(teacher.id)} 
                  variant="outline" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  {t("delete-account") || "Delete Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeachersTab;
