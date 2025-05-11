
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/types/pokemon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface AdminClassListProps {
  classes: Class[];
  onClassUpdated: () => void;
}

const AdminClassList: React.FC<AdminClassListProps> = ({ classes, onClassUpdated }) => {
  const [editing, setEditing] = useState<Class | null>(null);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load teachers and schools for dropdowns
    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      setTeachers(allTeachers);

      const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
      setSchools(allSchools);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const handleEdit = (classItem: Class) => {
    setEditing(classItem);
    setName(classItem.name);
    setTeacherId(classItem.teacherId);
    setSchoolId(classItem.schoolId);
  };

  const handleSave = () => {
    if (!editing) return;

    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.map((c: Class) => {
        if (c.id === editing.id) {
          return {
            ...c,
            name,
            teacherId,
            schoolId
          };
        }
        return c;
      });

      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      onClassUpdated();
      setEditing(null);
      
      toast({
        title: "Success",
        description: "Class updated successfully"
      });
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update class"
      });
    }
  };

  const handleDelete = (classId: string) => {
    try {
      // Check if there are students in this class
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const studentsInClass = allStudents.filter((s: any) => s.classId === classId);
      
      if (studentsInClass.length > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot delete class with students. Please remove or reassign students first."
        });
        return;
      }

      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.filter((c: Class) => c.id !== classId);

      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      onClassUpdated();
      
      toast({
        title: "Success",
        description: "Class deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete class"
      });
    }
  };

  const handleManageClass = (classId: string) => {
    navigate(`/admin-dashboard/classes/${classId}`);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.displayName : "Unknown teacher";
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Unknown school";
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell>{classItem.name}</TableCell>
              <TableCell>{getSchoolName(classItem.schoolId)}</TableCell>
              <TableCell>{getTeacherName(classItem.teacherId)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" onClick={() => handleManageClass(classItem.id)}>Manage</Button>
                <Button variant="ghost" onClick={() => handleEdit(classItem)}>Edit</Button>
                <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(classItem.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
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
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminClassList;
