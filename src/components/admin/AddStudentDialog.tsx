
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ 
  isOpen,
  onClose,
  onStudentAdded
}) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load classes for dropdown
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      setClasses(allClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  }, [isOpen]);

  const handleCreateStudent = () => {
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username is required",
      });
      return;
    }

    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");

      // Check if the username already exists
      const usernameExists = allStudents.some((student: any) => 
        student.username.toLowerCase() === username.trim().toLowerCase()
      );
      
      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username already exists",
        });
        return;
      }

      // Create a new student object
      const newStudent = {
        id: `student-${Date.now()}`,
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        classId: classId || undefined,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
      };

      // Add the new student to the array
      allStudents.push(newStudent);

      // Save the updated array back to localStorage
      localStorage.setItem("students", JSON.stringify(allStudents));

      // Clear the input fields
      setUsername("");
      setDisplayName("");
      setClassId("");
      
      // Close the dialog
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
    setUsername("");
    setDisplayName("");
    setClassId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="displayName" className="text-right">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="col-span-3"
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">
              Class
            </Label>
            <Select
              value={classId}
              onValueChange={setClassId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default AddStudentDialog;
