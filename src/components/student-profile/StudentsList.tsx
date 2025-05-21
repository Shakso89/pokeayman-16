
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Student {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  classId?: string;
}

interface StudentsListProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentsAdded?: (studentIds: string[]) => Promise<void>;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  classId,
  open,
  onOpenChange,
  onStudentsAdded
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [mode, setMode] = useState<"view" | "select">("view");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      loadStudents();
      // If onStudentsAdded is provided, we're in selection mode
      setMode(onStudentsAdded ? "select" : "view");
    } else {
      // Reset selection when dialog closes
      setSelectedStudents([]);
    }
  }, [open, classId, onStudentsAdded]);

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
    setLoading(true);
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      
      // For view mode - filter students for this class
      // For select mode - get students not in this class
      const displayStudents = onStudentsAdded 
        ? allStudents.filter((student: Student) => student.classId !== classId)
        : allStudents.filter((student: Student) => student.classId === classId);
      
      setStudents(displayStudents);
      setFilteredStudents(displayStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-students"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    if (mode === "select") {
      // Toggle student selection
      setSelectedStudents(prev => 
        prev.includes(studentId) 
          ? prev.filter(id => id !== studentId) 
          : [...prev, studentId]
      );
    } else {
      navigate(`/student/profile/${studentId}`);
      onOpenChange(false);
    }
  };

  const handleAddStudents = async () => {
    if (onStudentsAdded && selectedStudents.length > 0) {
      try {
        setLoading(true);
        await onStudentsAdded(selectedStudents);
        onOpenChange(false);
      } catch (error) {
        console.error("Error adding students:", error);
        toast({
          title: t("error"),
          description: t("failed-to-add-students"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "select" ? t("add-students-to-class") : t("class-students")}
          </DialogTitle>
          <DialogDescription>
            {mode === "select" 
              ? t("select-students-to-add") 
              : t("view-students-in-class")}
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-t-0 border-r-0 rounded-full border-blue-500" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    mode === "select" && selectedStudents.includes(student.id) 
                      ? "bg-blue-50 border-blue-300" 
                      : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{student.displayName}</p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                  </div>
                  {mode === "select" && (
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      selectedStudents.includes(student.id) 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : "border-gray-300"
                    }`}>
                      {selectedStudents.includes(student.id) && <Check className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">
                {searchQuery 
                  ? t("no-students-found") 
                  : mode === "select" 
                    ? t("no-students-available") 
                    : t("no-students-in-class")}
              </p>
            </div>
          )}
        </div>

        {mode === "select" && (
          <DialogFooter>
            <Button
              disabled={selectedStudents.length === 0 || loading}
              onClick={handleAddStudents}
              className="w-full bg-sky-500 hover:bg-sky-600"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {t("adding")}...
                </>
              ) : (
                <>
                  {t("add")} {selectedStudents.length} {t("students")}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
