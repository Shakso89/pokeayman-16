
import React, { useState, useEffect } from "react";
import { Student } from "@/types/pokemon";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface StudentsListProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentsAdded: (studentIds: string[]) => void;
  viewMode?: boolean; // Add viewMode prop to indicate if we're just viewing students
}

export const StudentsList = ({
  classId,
  open,
  onOpenChange,
  onStudentsAdded,
  viewMode = false
}: StudentsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]); // Use Student type
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentStudents, setCurrentStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getClassStudents();
      searchStudents();
    } else {
      // Clear state when dialog closes
      setSelectedStudents([]);
      setSearchQuery("");
    }
  }, [open, classId, searchQuery]);

  const getClassStudents = async () => {
    try {
      // Try to get class from localStorage
      const classes = JSON.parse(localStorage.getItem("classes") || "[]");
      const classData = classes.find((c: any) => c.id === classId);
      
      if (classData && classData.students) {
        setCurrentStudents(classData.students);
      } else {
        setCurrentStudents([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching class students:", error);
      setCurrentStudents([]);
      setIsLoading(false);
    }
  };

  const searchStudents = async () => {
    try {
      // Try to fetch from Supabase first
      const query = supabase.from("students").select("*");
      
      if (searchQuery) {
        query.ilike("username", `%${searchQuery}%`);
      }
      
      const { data: studentsData, error } = await query;
      
      if (error) throw error;
      
      if (studentsData && studentsData.length > 0) {
        console.log(`Found ${studentsData.length} students in Supabase:`, studentsData);
        
        // Filter out students already in the class
        const filteredStudents = studentsData.filter(
          student => 
          !currentStudents.includes(student.id)
        );
        
        // Fix the mapping to include all required Student properties
        const mappedStudents = filteredStudents.map(student => ({
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.username,
          teacherId: student.teacher_id || "",
          schoolId: "",  // Add required properties for the Student type
          avatar: "",
          class_id: student.class_id || null,
          classId: student.class_id || null
        }));
        
        setStudents(mappedStudents);
      } else {
        throw new Error("No students found in Supabase");
      }
    } catch (supabaseError) {
      console.error("Error searching in Supabase:", supabaseError);
      
      // Fallback to localStorage
      try {
        const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
        const filteredStudents = storedStudents.filter((student: any) => {
          // Filter by search query
          const matchesSearch = !searchQuery || student.username.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Filter out students already in the class
          const notInClass = !currentStudents.includes(student.id);
          
          return matchesSearch && notInClass;
        });
        
        console.log(`Found ${filteredStudents.length} students in localStorage:`, filteredStudents);
        
        // Map to correctly include all required Student properties
        const mappedStudents = filteredStudents.map((student: any) => ({
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.displayName || student.username,
          teacherId: student.teacher_id || student.teacherId || "",
          schoolId: student.school_id || student.schoolId || "", 
          avatar: student.avatar || "",
          class_id: student.class_id || student.classId || null,
          classId: student.class_id || student.classId || null
        }));
        
        setStudents(mappedStudents);
      } catch (localError) {
        console.error("Error searching in localStorage:", localError);
        setStudents([]);
      }
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleStudentClick = (student: Student) => {
    if (viewMode) {
      // In view mode, clicking navigates to student profile
      navigate(`/teacher/student/${student.id}`);
    } else {
      // In selection mode, clicking selects/deselects the student
      toggleStudent(student.id);
    }
  };

  const handleAddStudents = () => {
    onStudentsAdded(selectedStudents);
    setSelectedStudents([]);
    onOpenChange(false);
    
    toast({
      title: t("success"),
      description: t("students-added-to-class"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {viewMode ? t("class-students") : t("add-students-to-class")}
          </DialogTitle>
          <DialogDescription>
            {viewMode 
              ? t("view-students-in-class") 
              : t("search-and-select-students")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder={t("search-students")}
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[300px] rounded-md border p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>{t("loading")}</p>
              </div>
            ) : students.length > 0 ? (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      viewMode ? 'hover:bg-gray-100 cursor-pointer' : ''
                    }`}
                    onClick={viewMode ? () => handleStudentClick(student) : undefined}
                  >
                    <div className="flex items-center space-x-2">
                      {!viewMode && (
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {student.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{student.username}
                        </p>
                      </div>
                    </div>
                    {viewMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/student/${student.id}`);
                        }}
                      >
                        {t("view-profile")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {searchQuery 
                    ? t("no-matching-students") 
                    : t("no-available-students")}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          {!viewMode && (
            <Button
              onClick={handleAddStudents}
              disabled={selectedStudents.length === 0}
            >
              {t("add-selected-students")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
