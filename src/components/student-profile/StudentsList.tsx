
import React, { useState, useEffect } from "react";
import { Student } from "@/types/pokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface StudentsListProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentsAdded: (studentIds: string[]) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  classId,
  open,
  onOpenChange,
  onStudentsAdded,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [currentStudents, setCurrentStudents] = useState<string[]>([]);

  // On component mount, fetch the current class data to get existing students
  useEffect(() => {
    if (classId && open) {
      fetchClassData();
      handleSearch(""); // Load initial students when opened
    }
  }, [classId, open]);

  // Fetch current class data to get list of students already in the class
  const fetchClassData = async () => {
    try {
      console.log("Fetching class data for ID:", classId);
      
      // First try Supabase
      const { data: classData, error } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log("Class data retrieved:", classData);
      setCurrentStudents(classData?.students || []);
      
    } catch (error) {
      console.error("Error fetching class data:", error);
      
      // Fallback to localStorage
      try {
        const classes = JSON.parse(localStorage.getItem("classes") || "[]");
        const currentClass = classes.find((c: any) => c.id === classId);
        if (currentClass) {
          console.log("Class found in localStorage:", currentClass);
          setCurrentStudents(currentClass.students || []);
        } else {
          console.warn("Class not found in localStorage");
          setCurrentStudents([]);
        }
      } catch (localError) {
        console.error("Error fetching from localStorage:", localError);
        setCurrentStudents([]);
      }
    }
  };

  // Handle search query when user types
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      console.log("Searching students with query:", query);
      
      // First try to search in Supabase
      const supabaseQuery = supabase
        .from('students')
        .select('*');
      
      // If there's a search query, filter by name or username
      if (query) {
        supabaseQuery.or(`display_name.ilike.%${query}%,username.ilike.%${query}%`);
      }
      
      const { data: supabaseStudents, error } = await supabaseQuery;
      
      if (error) {
        throw error;
      }
      
      if (Array.isArray(supabaseStudents) && supabaseStudents.length > 0) {
        console.log(`Found ${supabaseStudents.length} students in Supabase:`, supabaseStudents);
        
        // Filter out students already in the class
        const filteredStudents = supabaseStudents.filter(student => 
          !currentStudents.includes(student.id)
        );
        
        // Map to compatible Student type
        const mappedStudents: Student[] = filteredStudents.map(student => ({
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.username,
          teacherId: student.teacher_id || '',
          createdAt: student.created_at || new Date().toISOString(),
        }));
        
        setStudents(mappedStudents);
      } else {
        throw new Error("No students found in Supabase");
      }
    } catch (error) {
      console.error("Error searching students in Supabase:", error);
      
      // Fallback to localStorage
      try {
        let allStudents = JSON.parse(localStorage.getItem("students") || "[]");
        console.log("Searching in localStorage with", allStudents.length, "students");
        
        if (query) {
          allStudents = allStudents.filter((student: any) => {
            const displayName = student.display_name || student.displayName || "";
            const username = student.username || "";
            return displayName.toLowerCase().includes(query.toLowerCase()) || 
                   username.toLowerCase().includes(query.toLowerCase());
          });
        }
        
        // Filter out students already in the class
        const filteredStudents = allStudents.filter((student: any) => 
          !currentStudents.includes(student.id)
        );
        
        console.log(`Found ${filteredStudents.length} students in localStorage:`, filteredStudents);
        
        // Map to compatible Student type
        const mappedStudents: Student[] = filteredStudents.map((student: any) => ({
          id: student.id,
          username: student.username,
          displayName: student.display_name || student.displayName || student.username,
          teacherId: student.teacher_id || student.teacherId || '',
          createdAt: student.created_at || student.createdAt || new Date().toISOString(),
        }));
        
        setStudents(mappedStudents);
      } catch (localError) {
        console.error("Error searching in localStorage:", localError);
        setStudents([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle student selection
  const toggleSelectStudent = (student: Student) => {
    if (selectedStudents.some(s => s.id === student.id)) {
      // If already selected, remove from selection
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      // If not selected, add to selection
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  // Clear all selected students
  const clearSelectedStudents = () => {
    setSelectedStudents([]);
  };

  // Add selected students to class
  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: t("error"),
        description: t("select-at-least-one-student"),
        variant: "destructive",
      });
      return;
    }

    const studentIds = selectedStudents.map(s => s.id);
    console.log("Adding students to class:", studentIds);
    
    try {
      // Call the callback to add students
      await onStudentsAdded(studentIds);
      
      // Clear selection and close dialog
      clearSelectedStudents();
      onOpenChange(false);
      
      toast({
        title: t("success"),
        description: `${studentIds.length} ${t("students-added-to-class")}`
      });
    } catch (error) {
      console.error("Error adding students:", error);
      
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
        variant: "destructive",
      });
    }
  };

  if (!open) return null;

  const isStudentSelected = (id: string) => selectedStudents.some(s => s.id === id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{t("add-students-to-class")}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search-students")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Selected students */}
          {selectedStudents.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-500">
                  {selectedStudents.length} {t("students-selected")}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSelectedStudents}
                  className="h-8 text-xs"
                >
                  {t("clear-all")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map((student) => (
                  <motion.div 
                    key={`selected-${student.id}`}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-sm">{student.displayName}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleSelectStudent(student)}
                      className="h-5 w-5 p-0 rounded-full hover:bg-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Students list */}
          <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">{t("no-students-found")}</p>
              </div>
            ) : (
              <ul className="divide-y">
                {students.map((student) => (
                  <motion.li
                    key={student.id}
                    className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      isStudentSelected(student.id) ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleSelectStudent(student)}
                    whileHover={{ backgroundColor: "#f7f9fc" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                        {student.displayName?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="font-medium">{student.displayName}</p>
                        <p className="text-xs text-gray-500">@{student.username}</p>
                      </div>
                    </div>
                    
                    <motion.button
                      className={`p-2 rounded-full ${
                        isStudentSelected(student.id)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSelectStudent(student)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <motion.div>
            <Button 
              onClick={handleAddStudents}
              disabled={selectedStudents.length === 0}
              className={selectedStudents.length === 0 ? "opacity-50" : ""}
            >
              {t("add-students")}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
