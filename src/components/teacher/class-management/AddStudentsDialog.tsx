
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchAvailableStudents();
    }
  }, [isOpen, classId]);

  const fetchAvailableStudents = async () => {
    setLoading(true);
    try {
      console.log("Fetching students for class:", classId);
      
      // Get current class data to see which students are already in it
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error("Error fetching class data:", classError);
        throw classError;
      }

      console.log("Class data:", classData);
      const currentStudentIds = classData?.students || [];

      // Get all students from database - try different approaches
      let allStudents: any[] = [];
      
      // First try: Get all students
      const { data: allStudentsData, error: allStudentsError } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (allStudentsError) {
        console.error("Error fetching all students:", allStudentsError);
      } else {
        allStudents = allStudentsData || [];
        console.log("All students found:", allStudents.length);
      }

      // Second try: Get students by teacher if no students found
      if (allStudents.length === 0 && user?.id) {
        const { data: teacherStudents, error: teacherError } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('is_active', true)
          .order('display_name', { ascending: true });

        if (!teacherError && teacherStudents) {
          allStudents = teacherStudents;
          console.log("Teacher's students found:", allStudents.length);
        }
      }

      // Third try: Get students without class assignment
      if (allStudents.length === 0) {
        const { data: unassignedStudents, error: unassignedError } = await supabase
          .from('students')
          .select('*')
          .is('class_id', null)
          .eq('is_active', true)
          .order('display_name', { ascending: true });

        if (!unassignedError && unassignedStudents) {
          allStudents = unassignedStudents;
          console.log("Unassigned students found:", allStudents.length);
        }
      }

      // Filter out students already in the current class
      const available = allStudents.filter(student => 
        !currentStudentIds.includes(student.id)
      );

      console.log("Available students after filtering:", available.length);
      setAvailableStudents(available);
      
    } catch (error) {
      console.error("Error fetching students:", error);
      setAvailableStudents([]);
      toast({
        title: t("error"),
        description: "Failed to load students",
        variant: "destructive"
      });
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
        
        <div className="max-h-[60vh] overflow-y-auto py-4">
          {loading ? (
            <p className="text-center py-4">{t("loading")}</p>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">{t("no-available-students")}</p>
              <p className="text-sm text-gray-400">
                Make sure students are created and not already assigned to this class
              </p>
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
                      <p className="text-xs text-orange-500">Currently in another class</p>
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
