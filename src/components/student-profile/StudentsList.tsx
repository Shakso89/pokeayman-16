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
  viewMode?: boolean;
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
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentStudents, setCurrentStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getClassStudents();
      fetchAllStudents();
    } else {
      // Clear state when dialog closes
      setSelectedStudents([]);
      setSearchQuery("");
      setStudents([]);
      setAllStudents([]);
    }
  }, [open, classId]);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim()) {
      const filtered = allStudents.filter(student =>
        student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setStudents(filtered);
    } else {
      setStudents(allStudents);
    }
  }, [searchQuery, allStudents]);

  const getClassStudents = async () => {
    try {
      // Get current students in the class from the student_classes join table
      const { data, error } = await supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId);

      if (error) {
        console.error("Error fetching class students:", error);
        setCurrentStudents([]);
      } else {
        setCurrentStudents(data?.map(item => item.student_id) || []);
      }
    } catch (error) {
      console.error("Error in getClassStudents:", error);
      setCurrentStudents([]);
    }
  };

  const fetchAllStudents = async () => {
    try {
      // Fetch all active students from Supabase
      const { data: studentsData, error } = await supabase
        .from("students")
        .select("id, username, display_name, class_id")
        .eq('is_active', true)
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      
      let studentsList: Student[] = [];
      
      if (studentsData) {
        studentsList = studentsData.map(student => ({
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.username,
          teacherId: "",
          schoolId: "",
          avatar: "",
          classId: student.class_id || null
        }));
      }

      // Filter students based on view mode
      if (viewMode) {
        // In view mode, show only students in the current class
        const classStudents = studentsList.filter(student => 
          currentStudents.includes(student.id)
        );
        setAllStudents(classStudents);
      } else {
        // In add mode, show students not already in this specific class
        const availableStudents = studentsList.filter(student => 
          !currentStudents.includes(student.id)
        );
        setAllStudents(availableStudents);
      }

    } catch (supabaseError) {
      console.error("Error searching in Supabase:", supabaseError);
      setAllStudents([]);
      toast({
        title: t("error"),
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      navigate(`/teacher/student/${student.id}`);
    } else {
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
              : "Search and select students to add to this class. Students can be in multiple classes within the same school."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students by name or username..."
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
                        {student.classId && !viewMode && (
                          <p className="text-xs text-blue-500">
                            {typeof student.classId === 'string' && student.classId.includes(',') 
                              ? 'In multiple classes' 
                              : 'In another class'}
                          </p>
                        )}
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
                    ? "No students found matching your search" 
                    : (viewMode ? "No students in this class" : t("no-available-students"))}
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
              {t("add")} {selectedStudents.length} {t("students")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
