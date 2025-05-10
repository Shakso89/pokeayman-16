
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Plus, School, Users, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Class, Student } from "@/types/pokemon";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, schoolId, teacherId }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
  });
  const [isNewClassDialogOpen, setIsNewClassDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [showStudentPokemon, setShowStudentPokemon] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPokemon, setStudentPokemon] = useState<any[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    // Load classes for this school
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const schoolClasses = parsedClasses.filter((cls: Class) => cls.schoolId === schoolId);
    setClasses(schoolClasses);
    
    // Load school name
    const savedSchools = localStorage.getItem("schools");
    const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    const school = parsedSchools.find((s: any) => s.id === schoolId);
    if (school) {
      setSchoolName(school.name);
    }
    
    // Load all students for this teacher
    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const teacherStudents = parsedStudents.filter((student: Student) => student.teacherId === teacherId);
    setAllStudents(teacherStudents);
  }, [schoolId, teacherId]);

  const handleCreateClass = () => {
    if (!newClass.name.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive",
      });
      return;
    }

    const classId = `class-${Date.now()}`;
    const newClassData: Class = {
      id: classId,
      name: newClass.name,
      description: newClass.description,
      schoolId,
      teacherId,
      students: [],
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    parsedClasses.push(newClassData);
    localStorage.setItem("classes", JSON.stringify(parsedClasses));

    // Update local state
    setClasses([...classes, newClassData]);
    setNewClass({ name: "", description: "" });
    setIsNewClassDialogOpen(false);

    toast({
      title: t("success"),
      description: t("class-created"),
    });
  };

  const handleDeleteClass = (classId: string) => {
    // Delete class from localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.filter((cls: Class) => cls.id !== classId);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    // Update local state
    setClasses(classes.filter(cls => cls.id !== classId));

    toast({
      title: t("success"),
      description: t("class-deleted"),
    });
  };

  const handleSelectClass = (cls: Class) => {
    setSelectedClass(cls);
    
    // Load students in this class
    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const classStudents = parsedStudents.filter((student: Student) => 
      cls.students?.includes(student.id)
    );
    setStudents(classStudents);
    
    // Determine available students (not already in this class)
    const studentsNotInClass = allStudents.filter(student => 
      !cls.students?.includes(student.id)
    );
    setAvailableStudents(studentsNotInClass);
  };

  const handleOpenStudentDialog = () => {
    setIsStudentDialogOpen(true);
  };

  const handleAddStudentToClass = (studentId: string) => {
    if (!selectedClass) return;
    
    // Add student to class in localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((cls: Class) => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          students: [...(cls.students || []), studentId],
        };
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Update local state
    const updatedClass = {
      ...selectedClass,
      students: [...(selectedClass.students || []), studentId],
    };
    setSelectedClass(updatedClass);
    setClasses(classes.map(cls => 
      cls.id === selectedClass.id ? updatedClass : cls
    ));
    
    // Update students list
    const studentToAdd = allStudents.find(s => s.id === studentId);
    if (studentToAdd) {
      setStudents([...students, studentToAdd]);
      setAvailableStudents(availableStudents.filter(s => s.id !== studentId));
    }
    
    setIsStudentDialogOpen(false);
    
    toast({
      title: t("success"),
      description: t("student-added-to-class"),
    });
  };

  const handleRemoveStudentFromClass = (studentId: string) => {
    if (!selectedClass) return;
    
    // Remove student from class in localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((cls: Class) => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          students: (cls.students || []).filter(id => id !== studentId),
        };
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Update local state
    const updatedClass = {
      ...selectedClass,
      students: (selectedClass.students || []).filter(id => id !== studentId),
    };
    setSelectedClass(updatedClass);
    setClasses(classes.map(cls => 
      cls.id === selectedClass.id ? updatedClass : cls
    ));
    
    // Update students list
    const removedStudent = students.find(s => s.id === studentId);
    setStudents(students.filter(s => s.id !== studentId));
    if (removedStudent) {
      setAvailableStudents([...availableStudents, removedStudent]);
    }
    
    toast({
      title: t("success"),
      description: t("student-removed-from-class"),
    });
  };

  const handleViewStudentPokemon = (student: Student) => {
    setSelectedStudent(student);
    
    // Get student pokemon data
    const pokemonData = localStorage.getItem("studentPokemons");
    if (pokemonData) {
      const pokemons = JSON.parse(pokemonData);
      const studentPokemons = pokemons.find((p: any) => p.studentId === student.id)?.pokemon || [];
      setStudentPokemon(studentPokemons);
    } else {
      setStudentPokemon([]);
    }
    
    setShowStudentPokemon(true);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h2 className="text-2xl font-bold">
            {selectedClass ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBackToClasses}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {selectedClass.name}
              </div>
            ) : (
              <>
                <School className="h-6 w-6 inline-block mr-2 text-blue-500" />
                {schoolName}: {t("classes")}
              </>
            )}
          </h2>
        </div>
        
        {!selectedClass && (
          <Button onClick={() => setIsNewClassDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("add-class")}
          </Button>
        )}
        
        {selectedClass && (
          <Button onClick={handleOpenStudentDialog} disabled={availableStudents.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            {t("add-student")}
          </Button>
        )}
      </div>
      
      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
                {cls.description && (
                  <CardDescription>{cls.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {cls.students?.length || 0} {t("students")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="default" 
                  onClick={() => handleSelectClass(cls)}
                >
                  {t("manage")}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteClass(cls.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {classes.length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="p-8 text-center">
                <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">{t("no-classes-yet")}</h3>
                <p className="text-gray-500 mb-6">{t("create-first-class-description")}</p>
                <Button onClick={() => setIsNewClassDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("create-first-class")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("students-in-class")}</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.displayName}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudentPokemon(student)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("view-pokemon")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudentFromClass(student.id)}
                            className="text-red-500 h-8"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t("remove")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">{t("no-students-yet")}</h3>
                <p className="text-gray-500 mb-6">{t("add-students-to-class-description")}</p>
                <Button 
                  onClick={handleOpenStudentDialog}
                  disabled={availableStudents.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {availableStudents.length > 0 ? t("add-student") : t("no-available-students")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Create Class Dialog */}
      <Dialog open={isNewClassDialogOpen} onOpenChange={setIsNewClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create-new-class")}</DialogTitle>
            <DialogDescription>
              {t("create-new-class-description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="className" className="block mb-2 text-sm font-medium">
                {t("class-name")}
              </label>
              <Input
                id="className"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                placeholder={t("enter-class-name")}
              />
            </div>
            
            <div>
              <label htmlFor="classDescription" className="block mb-2 text-sm font-medium">
                {t("description")} ({t("optional")})
              </label>
              <Input
                id="classDescription"
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                placeholder={t("enter-class-description")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClassDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateClass}>
              {t("create-class")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Student Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("add-student-to-class")}</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            {availableStudents.length > 0 ? (
              <div className="space-y-4">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{student.displayName}</p>
                      <p className="text-sm text-gray-500">{student.username}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddStudentToClass(student.id)}>
                      {t("add")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6">{t("no-available-students")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Pokemon Dialog */}
      <Dialog open={showStudentPokemon} onOpenChange={setShowStudentPokemon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.displayName}'s {t("pokemon")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {studentPokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {studentPokemon.map((pokemon, index) => (
                  <div key={index} className="text-center">
                    <img 
                      src={pokemon.image || "/placeholder.svg"} 
                      alt={pokemon.name} 
                      className="w-20 h-20 mx-auto object-contain" 
                    />
                    <p className="text-sm font-medium mt-2">{pokemon.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6">{t("no-pokemon-yet")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
