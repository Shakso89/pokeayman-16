
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddStudentsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onStudentsAdded: (studentIds: string[]) => void;
}

const AddStudentsDialog: React.FC<AddStudentsDialogProps> = ({
  isOpen,
  onOpenChange,
  classId,
  onStudentsAdded
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      fetchAllStudents();
    } else {
      // Reset state when dialog closes
      setSelectedStudents([]);
      setSearchQuery("");
      setAvailableStudents([]);
      setAllStudents([]);
    }
  }, [isOpen, classId]);

  React.useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim()) {
      const filtered = allStudents.filter(student =>
        student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.display_name && student.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setAvailableStudents(filtered);
    } else {
      setAvailableStudents(allStudents);
    }
  }, [searchQuery, allStudents]);

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      console.log("Fetching students for class:", classId);
      
      // Get current class data to check which school it belongs to
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('students, school_id')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error("Error fetching class data:", classError);
        throw classError;
      }

      console.log("Class data:", classData);
      const currentStudentIds = classData?.students || [];
      const schoolId = classData?.school_id;

      // Get all students from database
      let allStudentsQuery = supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      // If we have a school context, try to get students from the same school
      // For now, we'll get all students and let teachers assign any student
      const { data: allStudentsData, error: allStudentsError } = await allStudentsQuery;

      if (allStudentsError) {
        console.error("Error fetching students:", allStudentsError);
        throw allStudentsError;
      }

      console.log("All students found:", allStudentsData?.length || 0);

      // For student assignment to multiple classes within the same school,
      // we don't filter out students who are already in other classes,
      // but we do filter out students already in THIS specific class
      const studentsNotInThisClass = (allStudentsData || []).filter(student => 
        !currentStudentIds.includes(student.id)
      );

      console.log("Students not in this class:", studentsNotInThisClass.length);
      setAllStudents(studentsNotInThisClass);
      setAvailableStudents(studentsNotInThisClass);
      
      // Fallback to localStorage if no students found
      if (studentsNotInThisClass.length === 0) {
        console.log("No students found in Supabase, trying localStorage...");
        const savedStudents = localStorage.getItem("students");
        if (savedStudents) {
          const localStudents = JSON.parse(savedStudents);
          const filteredLocal = localStudents.filter((student: any) => 
            !currentStudentIds.includes(student.id) && student.is_active !== false
          );
          console.log("Students from localStorage:", filteredLocal.length);
          setAllStudents(filteredLocal);
          setAvailableStudents(filteredLocal);
        }
      }
      
    } catch (error) {
      console.error("Error fetching students:", error);
      
      // Enhanced fallback to localStorage
      try {
        const savedStudents = localStorage.getItem("students");
        const savedClasses = localStorage.getItem("classes");
        
        if (savedStudents && savedClasses) {
          const localStudents = JSON.parse(savedStudents);
          const localClasses = JSON.parse(savedClasses);
          
          const currentClass = localClasses.find((cls: any) => cls.id === classId);
          const currentStudentIds = currentClass?.students || [];
          
          const availableLocal = localStudents.filter((student: any) => 
            !currentStudentIds.includes(student.id) && student.is_active !== false
          );
          
          console.log("Fallback: Students from localStorage:", availableLocal.length);
          setAllStudents(availableLocal);
          setAvailableStudents(availableLocal);
        } else {
          toast({
            title: t("error"),
            description: "No students found. Please create students first.",
            variant: "destructive"
          });
        }
      } catch (localError) {
        console.error("Error accessing localStorage:", localError);
        toast({
          title: t("error"),
          description: "Failed to load students from any source",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  const handleAddStudents = () => {
    if (selectedStudents.length === 0) return;
    
    onStudentsAdded(selectedStudents);
    setSelectedStudents([]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add-students-to-class")}</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto py-4">
          {loading ? (
            <p className="text-center py-4">{t("loading")}</p>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">
                {searchQuery 
                  ? "No students found matching your search" 
                  : t("no-available-students")
                }
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-400">
                  Make sure students are created and not already assigned to this specific class
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <div 
                  key={student.id}
                  className={`p-3 border rounded-lg flex items-center cursor-pointer hover:bg-gray-50 ${
                    selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => toggleStudentSelection(student.id)}
                >
                  <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                    {(student.display_name || student.username || '??')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.display_name || student.username}</p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                    {student.class_id && (
                      <p className="text-xs text-blue-500">
                        Currently in {Array.isArray(student.class_id) ? 'multiple classes' : 'another class'}
                      </p>
                    )}
                  </div>
                  <div 
                    className={`w-5 h-5 border rounded-sm ${
                      selectedStudents.includes(student.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedStudents.includes(student.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button 
            disabled={selectedStudents.length === 0}
            onClick={handleAddStudents}
          >
            {t("add")} {selectedStudents.length} {t("students")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentsDialog;
