
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number;
  coinsSpent?: number;
  isActive: boolean;
}

interface StudentsTabProps {
  students: StudentData[];
  setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
  t: (key: string, fallback?: string) => string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ students, setStudents, t }) => {
  const handleToggleAccount = (userId: string) => {
    const updatedStudents = students.map(student => {
      if (student.id === userId) {
        const newIsActive = !student.isActive;
        return {
          ...student,
          isActive: newIsActive
        };
      }
      return student;
    });
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    toast({
      title: "Student account updated",
      description: `Student account has been ${updatedStudents.find(s => s.id === userId)?.isActive ? "activated" : "frozen"}`
    });
  };

  const handleDeleteAccount = (userId: string) => {
    const filteredStudents = students.filter(student => student.id !== userId);
    setStudents(filteredStudents);
    localStorage.setItem("students", JSON.stringify(filteredStudents));
    toast({
      title: "Student account deleted",
      description: "Student account has been permanently deleted"
    });
  };

  return (
    <div className="grid gap-4">
      {students.map(student => (
        <Card key={student.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>{student.displayName} ({student.username})</span>
              <Badge className={student.isActive ? "bg-green-500" : "bg-red-500"}>
                {student.isActive ? t("active") || "Active" : t("frozen") || "Frozen"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{t("teacher-id") || "Teacher ID"}</p>
                <p>{student.teacherId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("created") || "Created"}</p>
                <p>{new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("last-login") || "Last Login"}</p>
                <p>{student.lastLogin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("time-spent") || "Time Spent"}</p>
                <p>{student.timeSpent} {t("minutes") || "minutes"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("coins-spent") || "Coins Spent"}</p>
                <p>{student.coinsSpent}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleToggleAccount(student.id)} 
                variant={student.isActive ? "destructive" : "default"}
              >
                {student.isActive ? t("freeze-account") || "Freeze Account" : t("unfreeze-account") || "Unfreeze Account"}
              </Button>
              <Button 
                onClick={() => handleDeleteAccount(student.id)} 
                variant="outline" 
                className="text-red-500 border-red-500 hover:bg-red-50"
              >
                {t("delete-account") || "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentsTab;
