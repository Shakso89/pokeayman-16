
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Teacher {
  id: string;
  username: string;
  displayName: string;
}

interface AdminTeacherListProps {
  teachers: Teacher[];
  onTeacherUpdated: () => void;
}

const AdminTeacherList: React.FC<AdminTeacherListProps> = ({ teachers, onTeacherUpdated }) => {
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();

  const handleEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setDisplayName(teacher.displayName);
  };

  const handleSave = () => {
    if (!editing) return;

    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const updatedTeachers = allTeachers.map((t: Teacher) => {
        if (t.id === editing.id) {
          return {
            ...t,
            displayName
          };
        }
        return t;
      });

      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      onTeacherUpdated();
      setEditing(null);
      
      toast({
        title: "Success",
        description: "Teacher updated successfully"
      });
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update teacher"
      });
    }
  };

  const handleDelete = (teacherId: string) => {
    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const updatedTeachers = allTeachers.filter((t: Teacher) => t.id !== teacherId);

      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      onTeacherUpdated();
      
      toast({
        title: "Success",
        description: "Teacher deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete teacher"
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.username}</TableCell>
              <TableCell>{teacher.displayName}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" onClick={() => handleEdit(teacher)}>Edit</Button>
                <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(teacher.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTeacherList;
