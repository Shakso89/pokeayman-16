import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, User, Edit, Trash, Search, PlusCircle } from "lucide-react";
import PokemonIcon from "../icons/PokemonIcon";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import StudentsTab from "../student/StudentsTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StudentManageDialog from "../dialogs/StudentManageDialog";
import { Class as ClassType, Student as StudentType } from "@/types/pokemon";

interface ClassManagementProps {
  onBack?: () => void;
  schoolId?: string;
  teacherId?: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, schoolId: propSchoolId, teacherId: propTeacherId }) => {
  const { classId } = useParams<{ classId: string }>();
  const [schoolId, setSchoolId] = useState<string | undefined>(propSchoolId || "");
  const [teacher, setTeacher] = useState<any | null>(null);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isManageStudentDialogOpen, setIsManageStudentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedClassName, setEditedClassName] = useState("");
  const [currentClass, setCurrentClass] = useState<ClassType | null>(null);

  useEffect(() => {
    if (classId) {
      loadClass();
    }
  }, [classId]);

  const loadClass = () => {
    try {
      const classes = JSON.parse(localStorage.getItem("classes") || "[]");
      const foundClass = classes.find((cls: ClassType) => cls.id === classId);
      if (foundClass) {
        setCurrentClass(foundClass);
        setEditedClassName(foundClass.name);
        setSchoolId(foundClass.schoolId);
        loadTeacher(foundClass.teacherId);
        loadStudents();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Class not found",
        });
      }
    } catch (error) {
      console.error("Error loading class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load class",
      });
    }
  };

  const loadTeacher = (teacherId: string) => {
    try {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const foundTeacher = teachers.find((t: any) => t.id === teacherId);
      if (foundTeacher) {
        setTeacher(foundTeacher);
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
    }
  };

  const loadStudents = () => {
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const classStudents = allStudents.filter((student: StudentType) => student.classId === classId);
      setStudents(classStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students",
      });
    }
  };

  const handleAddStudent = () => {
    setIsAddingStudent(true);
  };

  const handleCreateStudent = () => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");

      // Check if the username already exists
      const usernameExists = allStudents.some((student: StudentType) => student.username === newStudentUsername);
      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username already exists",
        });
        return;
      }

      // Create a new student object
      const newStudent: StudentType = {
        id: `student-${Date.now()}`,
        username: newStudentUsername,
        displayName: newStudentUsername,
        classId: classId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentUsername}`,
        createdAt: new Date().toISOString(),
        teacherId: teacher?.id,
        schoolId: schoolId,
      };

      // Add the new student to the array
      allStudents.push(newStudent);

      // Save the updated array back to localStorage
      localStorage.setItem("students", JSON.stringify(allStudents));

      // Clear the input field and close the form
      setNewStudentUsername("");
      setIsAddingStudent(false);

      // Show success message
      toast({
        title: "Success",
        description: "Student created successfully",
      });

      // Refresh student list
      loadStudents();
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student",
      });
    }
  };

  const handleCancelCreateStudent = () => {
    setNewStudentUsername("");
    setIsAddingStudent(false);
  };

  const handleOpenManageStudentDialog = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsManageStudentDialogOpen(true);
  };

  const handleCloseManageStudentDialog = () => {
    setSelectedStudentId(null);
    setSelectedStudentName(null);
    setIsManageStudentDialogOpen(false);
  };

  const handleRemoveStudentFromClass = (studentId: string) => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      
      // Find the student to update
      const updatedStudents = allStudents.map((student: StudentType) => {
        if (student.id === studentId) {
          // Remove the classId from this student
          return { ...student, classId: undefined };
        }
        return student;
      });
      
      // Save updated students back to localStorage
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      // Show success message
      toast({
        title: "Success",
        description: "Student removed from class",
      });
      
      // Refresh student list
      loadStudents();
    } catch (error) {
      console.error("Error removing student from class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove student from class",
      });
    }
  };

  const handleRemoveStudent = () => {
    if (selectedStudentId) {
      handleRemoveStudentFromClass(selectedStudentId);
      handleCloseManageStudentDialog();
    }
  };

  const handleOpenEditDialog = () => {
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
        if (cls.id === classId) {
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

      // Refresh class
      loadClass();
      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating class name:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update class name",
      });
    }
  };

  const handleRemoveStudentFromClassDialog = () => {
    if (selectedStudentId) {
      handleRemoveStudentFromClass(selectedStudentId);
      handleCloseManageStudentDialog();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1">
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
        <CardContent className="flex-1">
          <StudentsTab classId={classId || ""} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </CardFooter>
      </Card>

      {isAddingStudent && (
        <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
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
              <Button type="button" variant="secondary" onClick={handleCancelCreateStudent}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleCreateStudent}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedStudentId && selectedStudentName && (
        <StudentManageDialog
          open={isManageStudentDialogOpen}
          onOpenChange={setIsManageStudentDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          onRemoveFromClass={handleRemoveStudentFromClassDialog}
        />
      )}

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
    </div>
  );
};

export default ClassManagement;
