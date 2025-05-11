
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import StudentsTab from "../student/StudentsTab";
import { useToast } from "@/hooks/use-toast";
import { Class as ClassType, Student as StudentType } from "@/types/pokemon";
import { Plus } from "lucide-react";
import ClassHeader from "./class/ClassHeader";
import ClassAddStudentDialog from "./class/ClassAddStudentDialog";
import StudentActionDialog from "./class/StudentActionDialog";

interface ClassManagementProps {
  onBack?: () => void;
  schoolId?: string;
  teacherId?: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, schoolId: propSchoolId, teacherId: propTeacherId }) => {
  const { classId } = useParams<{ classId: string }>();
  const [schoolId, setSchoolId] = useState<string | undefined>(propSchoolId || "");
  const [teacher, setTeacher] = useState<any | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isManageStudentDialogOpen, setIsManageStudentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const { toast } = useToast();
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
        setSchoolId(foundClass.schoolId);
        loadTeacher(foundClass.teacherId);
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

  const handleAddStudent = () => {
    setIsAddingStudent(true);
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
      
      // Close dialog and refresh student list
      handleCloseManageStudentDialog();
      loadClass();
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
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1">
        <ClassHeader 
          currentClass={currentClass} 
          onClassUpdated={loadClass} 
        />
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

      <ClassAddStudentDialog
        isOpen={isAddingStudent}
        onClose={() => setIsAddingStudent(false)}
        classId={classId || ""}
        onStudentAdded={loadClass}
      />

      {selectedStudentId && selectedStudentName && (
        <StudentActionDialog
          open={isManageStudentDialogOpen}
          onOpenChange={setIsManageStudentDialogOpen}
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          onRemoveFromClass={handleRemoveStudent}
        />
      )}
    </div>
  );
};

export default ClassManagement;
