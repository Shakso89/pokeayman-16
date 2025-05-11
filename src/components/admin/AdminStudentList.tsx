
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminStudentListProps {
  students: Student[];
  onStudentUpdated: () => void;
}

const AdminStudentList: React.FC<AdminStudentListProps> = ({ students, onStudentUpdated }) => {
  const [editing, setEditing] = useState<Student | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    // Load classes for dropdown
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      setClasses(allClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  }, []);

  const handleEdit = (student: Student) => {
    setEditing(student);
    setDisplayName(student.displayName);
    setClassId(student.classId || "");
  };

  const handleSave = () => {
    if (!editing) return;

    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const updatedStudents = allStudents.map((s: Student) => {
        if (s.id === editing.id) {
          return {
            ...s,
            displayName,
            classId: classId || undefined
          };
        }
        return s;
      });

      localStorage.setItem("students", JSON.stringify(updatedStudents));
      onStudentUpdated();
      setEditing(null);
      
      toast({
        title: "Success",
        description: "Student updated successfully"
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student"
      });
    }
  };

  const handleDelete = (studentId: string) => {
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const updatedStudents = allStudents.filter((s: Student) => s.id !== studentId);

      localStorage.setItem("students", JSON.stringify(updatedStudents));
      onStudentUpdated();
      
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student"
      });
    }
  };

  const getClassName = (classId: string | undefined) => {
    if (!classId) return "Not assigned";
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : "Unknown class";
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.username}</TableCell>
              <TableCell>{student.displayName}</TableCell>
              <TableCell>{getClassName(student.classId)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" onClick={() => handleEdit(student)}>Edit</Button>
                <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(student.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
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
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminStudentList;
