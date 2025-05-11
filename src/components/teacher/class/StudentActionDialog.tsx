
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudentActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName: string | null;
  onRemoveFromClass: () => void;
}

const StudentActionDialog: React.FC<StudentActionDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  onRemoveFromClass,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Student - {studentName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            What would you like to do with this student?
          </p>
          <div className="space-y-2">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={onRemoveFromClass}
            >
              Remove from class
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentActionDialog;
