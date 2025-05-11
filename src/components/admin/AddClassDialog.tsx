
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClassAdded: () => void;
}

const AddClassDialog: React.FC<AddClassDialogProps> = ({ 
  isOpen,
  onClose,
  onClassAdded
}) => {
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load teachers and schools for dropdowns
      try {
        const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        setTeachers(allTeachers);

        const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
        setSchools(allSchools);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, [isOpen]);

  const handleCreateClass = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Class name is required",
      });
      return;
    }

    if (!teacherId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Teacher is required",
      });
      return;
    }

    if (!schoolId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "School is required",
      });
      return;
    }

    try {
      // Get all classes from localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");

      // Check if the class name already exists for this teacher
      const classExists = allClasses.some((cls: any) => 
        cls.name.toLowerCase() === name.trim().toLowerCase() &&
        cls.teacherId === teacherId &&
        cls.schoolId === schoolId
      );
      
      if (classExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A class with this name already exists for this teacher and school",
        });
        return;
      }

      // Create a new class object
      const newClass = {
        id: `class-${Date.now()}`,
        name: name.trim(),
        teacherId,
        schoolId,
        createdAt: new Date().toISOString()
      };

      // Add the new class to the array
      allClasses.push(newClass);

      // Save the updated array back to localStorage
      localStorage.setItem("classes", JSON.stringify(allClasses));

      // Clear the input fields
      resetForm();
      
      // Close the dialog
      onClose();

      // Show success message
      toast({
        title: "Success",
        description: "Class created successfully",
      });

      // Refresh class list
      onClassAdded();
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create class",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setTeacherId("");
    setSchoolId("");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Class Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="school" className="text-right">
              School
            </Label>
            <Select
              value={schoolId}
              onValueChange={setSchoolId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher" className="text-right">
              Teacher
            </Label>
            <Select
              value={teacherId}
              onValueChange={setTeacherId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateClass}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;
