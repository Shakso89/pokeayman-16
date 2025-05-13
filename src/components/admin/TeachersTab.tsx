import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";
import { Teacher } from "@/types/database";

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
  const handleToggleAccount = async (userId: string) => {
    try {
      const teacher = teachers.find(t => t.id === userId);
      if (!teacher) return;
      
      const newIsActive = !teacher.isActive;
      
      // Update in Supabase
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: newIsActive } as Partial<Teacher>)
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.id === userId) {
          return {
            ...teacher,
            isActive: newIsActive
          };
        }
        return teacher;
      });
      
      setTeachers(updatedTeachers);
      
      toast({
        title: "Teacher account updated",
        description: `Teacher account has been ${newIsActive ? "activated" : "frozen"}`
      });
    } catch (error: any) {
      console.error("Error toggling teacher account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher account",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      const filteredTeachers = teachers.filter(teacher => teacher.id !== userId);
      setTeachers(filteredTeachers);
      
      toast({
        title: "Teacher account deleted",
        description: "Teacher account has been permanently deleted"
      });
    } catch (error: any) {
      console.error("Error deleting teacher account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher account",
        variant: "destructive"
      });
    }
  };

  const clearAllNonAdminAccounts = async () => {
    if (!confirm("WARNING: This will delete ALL teacher and student accounts except for Admin and Ayman. This action CANNOT be undone. Are you sure?")) {
      return;
    }
    
    try {
      // First delete all students
      const { error: studentsError } = await supabase
        .from('students')
        .delete()
        .not('teacher_id', 'in', ['admin', 'Admin']);
      
      if (studentsError) throw studentsError;
      
      // Then delete all non-admin teachers
      const { error: teachersError } = await supabase
        .from('teachers')
        .delete()
        .not('username', 'in', ['Admin', 'Ayman']);
        
      if (teachersError) throw teachersError;
      
      // Update local state
      const adminTeachers = teachers.filter(
        teacher => teacher.username === "Admin" || teacher.username === "Ayman"
      );
      setTeachers(adminTeachers);
      
      toast({
        title: "Database cleared",
        description: "All non-admin teacher and student accounts have been deleted"
      });
    } catch (error: any) {
      console.error("Error clearing accounts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear accounts",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid gap-4">
      <Card className="bg-yellow-50 border-yellow-300">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-600" />
            <h3 className="font-bold text-yellow-800">{t("danger-zone") || "Danger Zone"}</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            {t("clear-accounts-warning") || "This will delete ALL teacher and student accounts except for Admin and Ayman. This action cannot be undone."}
          </p>
          <Button 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={clearAllNonAdminAccounts}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("clear-all-accounts") || "Clear All Non-Admin Accounts"}
          </Button>
        </CardContent>
      </Card>
      
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
