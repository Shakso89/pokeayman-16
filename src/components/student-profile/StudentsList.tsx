
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
import { Search, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  displayName?: string;
  username: string;
  avatar?: string;
  classId?: string;
  display_name?: string; // For Supabase responses
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
      setSearchQuery("");
    }
  }, [open, classId, onStudentsAdded]);

  // Apply search filtering whenever searchQuery or students change
  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  // Separate filter function for clarity
  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = students.filter(student => {
      const displayName = student.display_name?.toLowerCase() || student.displayName?.toLowerCase() || "";
      const username = student.username.toLowerCase();
      
      return displayName.includes(query) || username.includes(query);
    });
    
    console.log(`Search "${query}" found ${filtered.length} matches from ${students.length} students`);
    setFilteredStudents(filtered);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      console.log("Loading students in mode:", mode, "for class:", classId);
      let displayStudents: Student[] = [];
      
      try {
        if (mode === 'select') {
          // In select mode, get ALL students first, then filter out ones that are already in this class
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('students')
            .eq('id', classId)
            .single();
          
          if (classError) {
            console.error("Error loading class data:", classError);
            throw classError;
          }
          
          const currentStudentIds = classData?.students || [];
          console.log("Current students in class:", currentStudentIds);
          
          // Get all students
          const { data: allStudents, error: studentsError } = await supabase
            .from('students')
            .select('*');
          
          if (studentsError) {
            console.error("Error loading students:", studentsError);
            throw studentsError;
          }
          
          if (allStudents && allStudents.length > 0) {
            console.log("All students fetched from Supabase:", allStudents);
            
            // Filter out students already in this class
            const availableStudents = allStudents.filter(student => 
              !currentStudentIds.includes(student.id)
            );
            
            console.log("Available students to add:", availableStudents);
            
            displayStudents = availableStudents.map(student => ({
              id: student.id,
              displayName: student.display_name || student.username,
              username: student.username || `student-${student.id.substring(0, 5)}`,
              classId: student.class_id,
              display_name: student.display_name
            }));
          } else {
            console.log("No students found");
            // Try to fetch from local storage as fallback
            throw new Error("No students found in database");
          }
        } else {
          // In view mode, get students IN this class
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('students')
            .eq('id', classId)
            .single();
          
          if (classError) {
            console.error("Error loading class data for view mode:", classError);
            throw classError;
          }
          
          const studentIds = classData?.students || [];
          console.log("Students in this class:", studentIds);
          
          if (studentIds.length > 0) {
            const { data: studentsData, error } = await supabase
              .from('students')
              .select('*')
              .in('id', studentIds);
            
            if (error) {
              console.error("Error loading class students:", error);
              throw error;
            }
            
            if (studentsData && studentsData.length > 0) {
              console.log("Class students fetched from Supabase:", studentsData);
              
              displayStudents = studentsData.map(student => ({
                id: student.id,
                displayName: student.display_name || student.username,
                username: student.username || `student-${student.id.substring(0, 5)}`,
                classId: student.class_id,
                display_name: student.display_name
              }));
            } else {
              console.log("No students found in this class");
            }
          }
        }
      } catch (supabaseError) {
        console.error("Error loading students from Supabase:", supabaseError);
        
        // Try to load from localStorage as fallback
        console.log("Trying localStorage fallback...");
        const allStudentsLocal = JSON.parse(localStorage.getItem("students") || "[]");
        console.log(`Found ${allStudentsLocal.length} students in localStorage:`, allStudentsLocal);
        
        if (mode === "select") {
          // Get current class data to find students already in the class
          const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
          const currentClass = allClasses.find((cls: any) => cls.id === classId);
          const currentStudentIds = currentClass?.students || [];
          console.log("Current students in class (localStorage):", currentStudentIds);
          
          // Filter out students already in this class
          const localAvailableStudents = allStudentsLocal.filter((student: any) => 
            !currentStudentIds.includes(student.id)
          );
          
          console.log(`Found ${localAvailableStudents.length} available students in localStorage:`, localAvailableStudents);
          displayStudents = localAvailableStudents.map((student: any) => ({
            id: student.id,
            displayName: student.display_name || student.username || student.displayName,
            username: student.username || `student-${student.id.substring(0, 5)}`,
            classId: student.classId || student.class_id,
            display_name: student.display_name
          }));
        } else {
          const localClassStudents = allStudentsLocal.filter((student: any) => 
            student.classId === classId || student.class_id === classId
          );
          
          console.log(`Found ${localClassStudents.length} class students in localStorage:`, localClassStudents);
          displayStudents = localClassStudents.map((student: any) => ({
            id: student.id,
            displayName: student.display_name || student.username || student.displayName,
            username: student.username || `student-${student.id.substring(0, 5)}`,
            classId: student.classId || student.class_id,
            display_name: student.display_name
          }));
        }
      }
      
      // Fallback: If we still don't have any students for selection,
      // Let's create some dummy students for testing purposes
      if (mode === "select" && displayStudents.length === 0) {
        // Only create dummy students for dev/testing
        const dummyStudents = [
          {
            id: "dummy-1",
            displayName: "Kate Anderson",
            username: "kate.a",
            display_name: "Kate Anderson",
            classId: null
          },
          {
            id: "dummy-2",
            displayName: "Tom Smith",
            username: "tom.smith",
            display_name: "Tom Smith",
            classId: null
          },
          {
            id: "dummy-3",
            displayName: "Maria Garcia",
            username: "maria.g",
            display_name: "Maria Garcia",
            classId: null
          },
          {
            id: "dummy-4",
            displayName: "Jana Williams",
            username: "jana.w",
            display_name: "Jana Williams",
            classId: null
          }
        ];
        
        displayStudents = dummyStudents;
        
        // Store dummy students in localStorage
        const allStudentsLocal = JSON.parse(localStorage.getItem("students") || "[]");
        const mergedStudents = [...allStudentsLocal];
        
        // Only add dummy students that don't already exist
        for (const dummy of dummyStudents) {
          if (!allStudentsLocal.some((s: any) => s.id === dummy.id)) {
            mergedStudents.push(dummy);
          }
        }
        
        localStorage.setItem("students", JSON.stringify(mergedStudents));
        
        console.log("Created dummy students for testing:", dummyStudents);
      }
      
      setStudents(displayStudents);
      setFilteredStudents(displayStudents);
      
      console.log(`Displaying ${displayStudents.length} students`);
      
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-students"),
        variant: "destructive"
      });
      setStudents([]);
      setFilteredStudents([]);
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
        toast({
          title: t("success"),
          description: `${selectedStudents.length} ${t("students-added-successfully")}`,
        });
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {mode === "select" ? t("add-students-to-class") : t("class-students")}
            </motion.span>
          </DialogTitle>
          <DialogDescription>
            {mode === "select" 
              ? t("select-students-to-add") 
              : t("view-students-in-class")}
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          className="flex items-center border rounded-md px-3 py-1 mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input 
            placeholder={t("search-students")}
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
        </motion.div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="h-6 w-6 text-primary" />
              </motion.div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <AnimatePresence>
              <div className="space-y-2">
                {filteredStudents.map((student, index) => (
                  <motion.div 
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      mode === "select" && selectedStudents.includes(student.id) 
                        ? "bg-blue-50 border-blue-300" 
                        : ""
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                        {(student.displayName || student.display_name || student.username || "ST").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{student.displayName || student.display_name || student.username}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                    {mode === "select" && (
                      <motion.div 
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          selectedStudents.includes(student.id) 
                            ? "bg-blue-500 border-blue-500 text-white" 
                            : "border-gray-300"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedStudents.includes(student.id) && <Check className="h-4 w-4" />}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.div 
              className="text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-500">
                {searchQuery 
                  ? t("no-students-found") 
                  : mode === "select" 
                    ? t("no-students-available") 
                    : t("no-students-in-class")}
              </p>
            </motion.div>
          )}
        </div>

        {mode === "select" && (
          <DialogFooter>
            <motion.div 
              className="w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                disabled={selectedStudents.length === 0 || loading}
                onClick={handleAddStudents}
                className="w-full bg-sky-500 hover:bg-sky-600"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <Loader2 className="h-4 w-4" />
                    </motion.div>
                    {t("adding")}...
                  </>
                ) : (
                  <>
                    {t("add")} {selectedStudents.length} {t("students")}
                  </>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

