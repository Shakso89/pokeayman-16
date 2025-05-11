
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types/pokemon";

interface ClassAddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onStudentAdded: () => void;
}

const ClassAddStudentDialog: React.FC<ClassAddStudentDialogProps> = ({ 
  isOpen,
  onClose,
  classId,
  onStudentAdded
}) => {
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const { toast } = useToast();

  const handleCreateStudent = () => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");

      // Check if the username already exists
      const usernameExists = allStudents.some((student: Student) => student.username === newStudentUsername);
      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username already exists",
        });
        return;
      }

      // Create a new student object
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        username: newStudentUsername,
        displayName: newStudentUsername,
        classId: classId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentUsername}`,
      };

      // Add the new student to the array
      allStudents.push(newStudent);

      // Save the updated array back to localStorage
      localStorage.setItem("students", JSON.stringify(allStudents));

      // Clear the input field and close the form
      setNewStudentUsername("");
      onClose();

      // Show success message
      toast({
        title: "Success",
        description: "Student created successfully",
      });

      // Refresh student list
      onStudentAdded();
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student",
      });
    }
  };

  const handleCancel = () => {
    setNewStudentUsername("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={newStudentUsername}
              onChange={(e) => setNewStudentUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateStudent}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassAddStudentDialog;
