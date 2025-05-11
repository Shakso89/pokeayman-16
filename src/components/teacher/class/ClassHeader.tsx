
import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Class as ClassType } from "@/types/pokemon";

interface ClassHeaderProps {
  currentClass: ClassType | null;
  onClassUpdated: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ currentClass, onClassUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedClassName, setEditedClassName] = useState(currentClass?.name || "");
  const { toast } = useToast();

  const handleOpenEditDialog = () => {
    setEditedClassName(currentClass?.name || "");
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveClassName = () => {
    try {
      // Get all classes from localStorage
      const classes = JSON.parse(localStorage.getItem("classes") || "[]");

      // Find the class to update
      const updatedClasses = classes.map((cls: ClassType) => {
        if (cls.id === currentClass?.id) {
          // Update the class name
          return { ...cls, name: editedClassName };
        }
        return cls;
      });

      // Save updated classes back to localStorage
      localStorage.setItem("classes", JSON.stringify(updatedClasses));

      // Show success message
      toast({
        title: "Success",
        description: "Class name updated successfully",
      });

      // Close dialog and refresh
      handleCloseEditDialog();
      onClassUpdated();
    } catch (error) {
      console.error("Error updating class name:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update class name",
      });
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {currentClass ? currentClass.name : "Loading..."}
          </CardTitle>
          <div>
            <Button variant="outline" size="icon" onClick={handleOpenEditDialog}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editedClassName}
                onChange={(e) => setEditedClassName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseEditDialog}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveClassName}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassHeader;
