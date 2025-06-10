
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  onStudentsAdded: () => void;
}

const AddStudentsDialog: React.FC<AddStudentsDialogProps> = ({
  open,
  onOpenChange,
  classId,
  className,
  onStudentsAdded
}) => {
  const { t } = useTranslation();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      fetchAvailableStudents();
    }
  }, [open, classId]);

  const fetchAvailableStudents = async () => {
    setLoading(true);
    try {
      // Get current class students
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      const currentStudents = classData?.students || [];

      // Get all students
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('display_name', { ascending: true });

      if (studentsError) throw studentsError;

      // Filter out students already in class
      const available = (allStudents || []).filter(student => 
        !currentStudents.includes(student.id)
      );

      setAvailableStudents(available);
    } catch (error) {
      console.error("Error fetching students:", error);
      setAvailableStudents([]);
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
  
  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      // Get current class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      // Update students array
      const updatedStudents = [...(classData?.students || []), ...selectedStudents];
      
      // Update class in Supabase
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', classId);
        
      if (error) throw error;

      // Also update student class_id fields
      for (const studentId of selectedStudents) {
        await supabase
          .from('students')
          .update({ class_id: classId })
          .eq('id', studentId);
      }
      
      toast({
        title: t("success"),
        description: `${selectedStudents.length} ${t("students-added-to-class")}`
      });
      
      setSelectedStudents([]);
      onStudentsAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add-students-to-class")}: {className}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto py-4">
          {loading ? (
            <p className="text-center py-4">{t("loading")}</p>
          ) : availableStudents.length === 0 ? (
            <p className="text-center py-4">{t("no-available-students")}</p>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <div 
                  key={student.id}
                  className={`p-3 border rounded-lg flex items-center cursor-pointer ${
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
