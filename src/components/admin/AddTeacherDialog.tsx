
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherAdded: () => void;
}

const AddTeacherDialog: React.FC<AddTeacherDialogProps> = ({ 
  isOpen,
  onClose,
  onTeacherAdded
}) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();

  const handleCreateTeacher = () => {
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username is required",
      });
      return;
    }

    try {
      // Get all teachers from localStorage
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");

      // Check if the username already exists
      const usernameExists = allTeachers.some((teacher: any) => 
        teacher.username.toLowerCase() === username.trim().toLowerCase()
      );
      
      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username already exists",
        });
        return;
      }

      // Create a new teacher object
      const newTeacher = {
        id: `teacher-${Date.now()}`,
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
      };

      // Add the new teacher to the array
      allTeachers.push(newTeacher);

      // Save the updated array back to localStorage
      localStorage.setItem("teachers", JSON.stringify(allTeachers));

      // Clear the input fields
      setUsername("");
      setDisplayName("");
      
      // Close the dialog
      onClose();

      // Show success message
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });

      // Refresh teacher list
      onTeacherAdded();
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create teacher",
      });
    }
  };

  const handleCancel = () => {
    setUsername("");
    setDisplayName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
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
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateTeacher}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherDialog;
