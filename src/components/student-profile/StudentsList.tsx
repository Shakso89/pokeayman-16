
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Student {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  classId?: string; // Added classId property to match the expected type
}

interface StudentsListProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  classId,
  open,
  onOpenChange
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open, classId]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        student => 
          student.displayName.toLowerCase().includes(query) || 
          student.username.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadStudents = () => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      
      // Filter students for this class
      const classStudents = allStudents.filter((student: Student) => student.classId === classId);
      
      setStudents(classStudents);
      setFilteredStudents(classStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-students"),
        variant: "destructive"
      });
    }
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/profile/${studentId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("class-students")}</DialogTitle>
          <DialogDescription>
            {t("view-students-in-class")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center border rounded-md px-3 py-1 mb-4">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input 
            placeholder={t("search-students")}
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filteredStudents.length > 0 ? (
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{student.displayName}</p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">{searchQuery ? t("no-students-found") : t("no-students-in-class")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
