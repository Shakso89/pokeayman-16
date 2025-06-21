
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AssignStarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  students: Array<{
    id: string;
    display_name?: string;
    username: string;
  }>;
  currentStarStudentId?: string;
  onStarAssigned: () => void;
}

const AssignStarDialog: React.FC<AssignStarDialogProps> = ({
  isOpen,
  onOpenChange,
  classId,
  students,
  currentStarStudentId,
  onStarAssigned
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignStar = async () => {
    if (!selectedStudentId) return;

    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ star_student_id: selectedStudentId })
        .eq('id', classId);

      if (error) throw error;

      const selectedStudent = students.find(s => s.id === selectedStudentId);
      const studentName = selectedStudent?.display_name || selectedStudent?.username || "Unknown";

      toast({
        title: "Success",
        description: `${studentName} is now the Star of the Class! ⭐`
      });

      onStarAssigned();
      onOpenChange(false);
      setSelectedStudentId("");
    } catch (error) {
      console.error("Error assigning star:", error);
      toast({
        title: "Error",
        description: "Failed to assign Star of the Class",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveStar = async () => {
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ star_student_id: null })
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Star of the Class has been removed"
      });

      onStarAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing star:", error);
      toast({
        title: "Error",
        description: "Failed to remove Star of the Class",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const currentStarStudent = students.find(s => s.id === currentStarStudentId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Assign Star of the Class
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentStarStudent && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Star of the Class:</p>
              <p className="font-medium">
                {currentStarStudent.display_name || currentStarStudent.username}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Student:</label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.display_name || student.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleAssignStar}
              disabled={!selectedStudentId || isAssigning}
              className="flex-1"
            >
              {isAssigning ? "Assigning..." : "Assign Star"}
            </Button>
            
            {currentStarStudentId && (
              <Button
                variant="outline"
                onClick={handleRemoveStar}
                disabled={isAssigning}
              >
                Remove Star
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStarDialog;
