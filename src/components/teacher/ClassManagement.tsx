
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChevronLeft, Plus, School, Users, Edit, Trash2, Eye, Search, UserPlus, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Class, Student } from "@/types/pokemon";
import { Badge } from "@/components/ui/badge";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, schoolId, teacherId }) => {
  const navigate = useNavigate();
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
  const [searchUsername, setSearchUsername] = useState("");
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isAddByUsernameOpen, setIsAddByUsernameOpen] = useState(false);
  const [isClassCreator, setIsClassCreator] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    // Check if current user is admin
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdminUser(username === "Admin");
    
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
    
    // Load all students
    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
    setAllStudents(parsedStudents);
    
    // Load all students for this teacher
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
      teacherId, // This teacher becomes the creator/owner
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
    // Get the class to check if current teacher is the creator
    const classToDelete = classes.find(cls => cls.id === classId);
    
    if (!classToDelete) return;
    
    // Only the creator or admin can delete the class
    if (classToDelete.teacherId !== teacherId && !isAdminUser) {
      toast({
        title: t("error"),
        description: t("only-class-creator-can-delete"),
        variant: "destructive",
      });
      return;
    }

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
    
    // Check if current teacher is the class creator
    setIsClassCreator(cls.teacherId === teacherId || isAdminUser);
    
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
    // Only the class creator can add students
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: t("only-class-creator-can-add-students"),
        variant: "destructive",
      });
      return;
    }
    
    setIsStudentDialogOpen(true);
  };

  const handleAddStudentToClass = (studentId: string) => {
    if (!selectedClass || !isClassCreator) return;
    
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
    } else {
      // If student doesn't exist in allStudents, fetch from localStorage
      const savedStudents = localStorage.getItem("students");
      const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
      const foundStudent = parsedStudents.find((s: Student) => s.id === studentId);
      
      if (foundStudent) {
        setStudents([...students, foundStudent]);
        setAllStudents([...allStudents, foundStudent]);
      }
    }
    
    setIsStudentDialogOpen(false);
    setIsAddByUsernameOpen(false);
    setSearchUsername("");
    setSearchResults([]);
    
    toast({
      title: t("success"),
      description: t("student-added-to-class"),
    });
  };

  const handleRemoveStudentFromClass = (studentId: string) => {
    if (!selectedClass) return;
    
    // Only the class creator can remove students
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: t("only-class-creator-can-remove-students"),
        variant: "destructive",
      });
      return;
    }
    
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
      const studentPokemons = pokemons.find((p: any) => p.studentId === student.id)?.pokemons || [];
      setStudentPokemon(studentPokemons);
    } else {
      setStudentPokemon([]);
    }
    
    setShowStudentPokemon(true);
  };

  const handleSearchStudents = () => {
    // Only the class creator can add students
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: t("only-class-creator-can-add-students"),
        variant: "destructive",
      });
      return;
    }
    
    if (!searchUsername.trim()) return;
    
    setIsSearchingStudent(true);
    
    try {
      const savedStudents = localStorage.getItem("students");
      const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];
      
      // Search by username (case insensitive)
      const results = parsedStudents.filter((student: Student) => 
        student.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
      
      // Filter out students already in this class
      const filteredResults = selectedClass ? 
        results.filter((student: Student) => !selectedClass.students.includes(student.id)) : 
        results;
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching students:", error);
      toast({
        title: t("error"),
        description: t("error-searching-students"),
        variant: "destructive",
      });
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  const handleViewStudentDetail = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const openAddByUsernameDialog = () => {
    // Only the class creator can add students
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: t("only-class-creator-can-add-students"),
        variant: "destructive",
      });
      return;
    }
    
    setIsAddByUsernameOpen(true);
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
                {!isClassCreator && (
                  <Badge variant="outline" className="ml-2 gap-1">
                    <Lock className="h-3 w-3" />
                    {t("view-only")}
                  </Badge>
                )}
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
        
        {selectedClass && isClassCreator && (
          <div className="flex gap-2">
            <Button onClick={openAddByUsernameDialog}>
              <UserPlus className="h-4 w-4 mr-1" />
              {t("add-by-username")}
            </Button>
            <Button onClick={handleOpenStudentDialog} disabled={availableStudents.length === 0}>
              <Plus className="h-4 w-4 mr-1" />
              {t("add-student")}
            </Button>
          </div>
        )}
      </div>
      
      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const isCreator = cls.teacherId === teacherId || isAdminUser;
            return (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{cls.name}</CardTitle>
                    {!isCreator && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        {t("view-only")}
                      </Badge>
                    )}
                  </div>
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
                    {isCreator ? t("manage") : t("view")}
                  </Button>
                  {isCreator && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
          
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
                      <TableCell>
                        <span 
                          className="cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => handleViewStudentDetail(student.id)}
                        >
                          {student.displayName}
                        </span>
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudentDetail(student.id)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("manage")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudentPokemon(student)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("view-pokemon")}
                          </Button>
                          {isClassCreator && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStudentFromClass(student.id)}
                              className="text-red-500 h-8"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("remove")}
                            </Button>
                          )}
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
                {isClassCreator && (
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={openAddByUsernameDialog}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t("add-by-username")}
                    </Button>
                    <Button 
                      onClick={handleOpenStudentDialog}
                      disabled={availableStudents.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {availableStudents.length > 0 ? t("add-student") : t("no-available-students")}
                    </Button>
                  </div>
                )}
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

      {/* Add Student by Username Dialog */}
      <Dialog open={isAddByUsernameOpen} onOpenChange={setIsAddByUsernameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("add-student-by-username")}</DialogTitle>
            <DialogDescription>
              {t("search-student-by-username")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex gap-2">
              <Input
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder={t("enter-username")}
              />
              <Button 
                onClick={handleSearchStudents}
                disabled={isSearchingStudent || !searchUsername.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {searchResults.map(student => (
                  <div key={student.id} className="border rounded-md p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{student.displayName}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddStudentToClass(student.id)}>
                      {t("add")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchUsername.trim() && !isSearchingStudent ? (
              <p className="text-center py-4 text-gray-500">{t("no-students-found")}</p>
            ) : null}
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
