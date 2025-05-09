
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, UserPlus, Trash2, School, Coins, Award } from "lucide-react";
import { 
  initializeClassPokemonPool, 
  getClassPokemonPool, 
  assignPokemonToStudent,
  awardCoinsToStudent,
  removePokemonFromStudent,
  removeCoinsFromStudent,
  initializeSchoolPokemonPool
} from "@/utils/pokemonData";
import { Pokemon, Class } from "@/types/pokemon";
import SchoolManagement from "./SchoolManagement";
import { useTranslation } from "@/hooks/useTranslation";

interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  schoolId: string;
  classId: string;
}

interface ClassManagementProps {
  onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const { t } = useTranslation();
  
  const [currentView, setCurrentView] = useState<"schools" | "classes" | "students" | "pokemon">("schools");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pokemonPool, setPokemonPool] = useState<Pokemon[]>([]);
  const [coinsToAward, setCoinsToAward] = useState<number>(1);
  const [coinsToRemove, setCoinsToRemove] = useState<number>(1);
  
  const [newClass, setNewClass] = useState({
    name: "",
  });
  
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: ""
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const teacherId = localStorage.getItem("teacherId") || "";

  // Load classes when school is selected
  useEffect(() => {
    if (selectedSchoolId && currentView === "classes") {
      loadClasses();
    }
  }, [selectedSchoolId, currentView]);
  
  // Load Pokemon pool when a school is selected for student management
  useEffect(() => {
    if (selectedSchoolId && currentView === "pokemon") {
      const pool = getClassPokemonPool(selectedSchoolId);
      if (pool) {
        setPokemonPool(pool.availablePokemons);
      } else {
        // Initialize pool if it doesn't exist
        const newPool = initializeSchoolPokemonPool(selectedSchoolId);
        setPokemonPool(newPool.availablePokemons);
      }
    }
  }, [selectedSchoolId, currentView]);

  const loadClasses = () => {
    if (!selectedSchoolId) return;
    
    const savedClasses = localStorage.getItem("classes");
    let schoolClasses: Class[] = [];
    
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      schoolClasses = parsedClasses.filter((cls: Class) => 
        cls.schoolId === selectedSchoolId && cls.teacherId === teacherId
      );
    }
    
    setClasses(schoolClasses);
  };

  const handleAddClass = () => {
    if (!newClass.name || !selectedSchoolId) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }

    const newClassId = `class-${Date.now()}`;
    const newClassObject: Class = {
      id: newClassId,
      name: newClass.name,
      schoolId: selectedSchoolId,
      teacherId: teacherId,
      students: [],
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    parsedClasses.push(newClassObject);
    localStorage.setItem("classes", JSON.stringify(parsedClasses));

    // Update local state
    setClasses([...classes, newClassObject]);
    setNewClass({ name: "" });
    
    toast({
      title: t("success"),
      description: t("class-created"),
    });
  };

  const handleUpdateClass = (classId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }

    // Update in localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedClasses = parsedClasses.map((cls: Class) =>
      cls.id === classId ? { ...cls, name: newName } : cls
    );
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    // Update local state
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, name: newName } : cls
    ));
    setEditingClassId(null);

    toast({
      title: t("success"),
      description: t("class-updated"),
    });
  };

  const handleDeleteClass = (classId: string) => {
    // Check if class has students
    const selectedClass = classes.find(cls => cls.id === classId);
    if (selectedClass && selectedClass.students.length > 0) {
      toast({
        title: t("error"),
        description: t("cannot-delete-class-with-students"),
        variant: "destructive"
      });
      return;
    }

    // Delete from localStorage
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

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.username || !newStudent.password || !selectedClassId || !selectedSchoolId) {
      toast({
        title: t("error"),
        description: t("fill-all-fields"),
        variant: "destructive"
      });
      return;
    }

    const studentId = `student-${Date.now()}`;
    const student = {
      id: studentId,
      displayName: newStudent.name,
      username: newStudent.username,
      password: newStudent.password,
      teacherId,
      schoolId: selectedSchoolId,
      classId: selectedClassId,
      createdAt: new Date().toISOString(),
      avatar: undefined,
      friends: []
    };

    // Add to students array
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    students.push(student);
    localStorage.setItem("students", JSON.stringify(students));
    
    // Add student to class
    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: [...cls.students, studentId]
        };
      }
      return cls;
    });
    
    setClasses(updatedClasses);
    
    // Update in localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedStoredClasses = parsedClasses.map((cls: Class) => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: [...cls.students, studentId]
        };
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedStoredClasses));
    
    // Reset form
    setNewStudent({ name: "", username: "", password: "" });
    
    toast({
      title: t("success"),
      description: t("student-added"),
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    // Remove from class
    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: cls.students.filter(id => id !== studentId)
        };
      }
      return cls;
    });
    
    setClasses(updatedClasses);
    
    // Update in localStorage
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const updatedStoredClasses = parsedClasses.map((cls: Class) => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: cls.students.filter((id: string) => id !== studentId)
        };
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedStoredClasses));
    
    // Remove student from students array
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const updatedStudents = students.filter((s: any) => s.id !== studentId);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    toast({
      title: t("success"),
      description: t("student-removed"),
    });
  };
  
  const handleAssignPokemon = (pokemonId: string) => {
    if (!selectedStudent || !selectedSchoolId) return;
    
    const success = assignPokemonToStudent(selectedSchoolId, selectedStudent.id, pokemonId);
    
    if (success) {
      toast({
        title: t("success"),
        description: t("pokemon-assigned", { name: selectedStudent.displayName }),
      });
      
      // Refresh the Pokemon pool
      const pool = getClassPokemonPool(selectedSchoolId);
      if (pool) {
        setPokemonPool(pool.availablePokemons);
      }
    } else {
      toast({
        title: t("error"),
        description: t("failed-assign-pokemon"),
        variant: "destructive"
      });
    }
  };

  const handleRemovePokemon = () => {
    if (!selectedStudent) return;
    
    const success = removePokemonFromStudent(selectedStudent.id);
    
    if (success) {
      toast({
        title: t("success"),
        description: t("random-pokemon-removed", { name: selectedStudent.displayName }),
      });
    } else {
      toast({
        title: t("error"),
        description: t("student-has-no-pokemon"),
        variant: "destructive"
      });
    }
  };
  
  const handleAwardCoins = () => {
    if (!selectedStudent) return;
    
    awardCoinsToStudent(selectedStudent.id, coinsToAward);
    
    toast({
      title: t("success"), 
      description: t("coins-awarded", { count: coinsToAward, name: selectedStudent.displayName }),
    });
    
    setCoinsToAward(1);
  };
  
  const handleRemoveCoins = () => {
    if (!selectedStudent) return;
    
    const success = removeCoinsFromStudent(selectedStudent.id, coinsToRemove);
    
    if (success) {
      toast({
        title: t("success"),
        description: t("coins-removed", { count: coinsToRemove, name: selectedStudent.displayName }),
      });
      setCoinsToRemove(1);
    } else {
      toast({
        title: t("error"),
        description: t("not-enough-coins"),
        variant: "destructive"
      });
    }
  };

  const getStudentsFromIds = (studentIds: string[]): Student[] => {
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    return allStudents.filter((student: any) => studentIds.includes(student.id));
  };

  // Schools management view
  if (currentView === "schools") {
    return (
      <SchoolManagement
        onBack={onBack}
        onSelectSchool={(schoolId) => {
          setSelectedSchoolId(schoolId);
          setCurrentView("classes");
        }}
        teacherId={teacherId}
      />
    );
  }

  // Classes management view
  if (currentView === "classes" && selectedSchoolId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedSchoolId(null);
              setCurrentView("schools");
            }}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back-to-schools")}
            </Button>
            <h2 className="text-2xl font-bold">{t("manage-classes")}</h2>
          </div>
        </div>
        
        <Card className="pokemon-card">
          <CardHeader>
            <CardTitle>{t("add-new-class")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder={t("class-name")}
                value={newClass.name}
                onChange={(e) => setNewClass({ name: e.target.value })}
              />
              <Button onClick={handleAddClass} className="pokemon-button">
                <Plus className="h-4 w-4 mr-1" />
                {t("add-class")}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="pokemon-card hover:shadow-md transition-shadow">
              {editingClassId === cls.id ? (
                <CardContent className="pt-6">
                  <Input
                    defaultValue={cls.name}
                    autoFocus
                    onBlur={(e) => handleUpdateClass(cls.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateClass(cls.id, e.currentTarget.value);
                      } else if (e.key === "Escape") {
                        setEditingClassId(null);
                      }
                    }}
                  />
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <School className="h-5 w-5 text-blue-500" />
                        {cls.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingClassId(cls.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{cls.students.length} {t("students")}</p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full pokemon-button"
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setCurrentView("students");
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t("manage-students")}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
          
          {classes.length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="p-8 text-center">
                <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">{t("no-classes-yet")}</h3>
                <p className="text-gray-500 mb-6">{t("create-first-class-description")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
  
  // Students management view
  if (currentView === "students" && selectedClass) {
    const students = getStudentsFromIds(selectedClass.students);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedClassId(null);
              setCurrentView("classes");
            }}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back-to-classes")}
            </Button>
            <h2 className="text-2xl font-bold ml-4">
              {t("students-in", { name: selectedClass.name })}
            </h2>
          </div>
          <Button
            onClick={() => {
              setCurrentView("pokemon");
            }}
            className="pokemon-button"
          >
            <span className="pokeball mr-2"></span>
            {t("manage-pokemon")}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="pokemon-card">
            <CardHeader>
              <CardTitle>{t("add-new-student")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">{t("full-name")}</Label>
                  <Input 
                    id="studentName" 
                    placeholder={t("enter-student-full-name")} 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentUsername">{t("username")}</Label>
                  <Input 
                    id="studentUsername" 
                    placeholder={t("create-username-for-student")} 
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentPassword">{t("password")}</Label>
                  <Input 
                    id="studentPassword" 
                    placeholder={t("create-password")} 
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddStudent}
                  className="pokemon-button"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("add-student")}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div>
            <h3 className="text-lg font-medium mb-4">{t("student-list")}</h3>
            {students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.displayName || student.name}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student);
                              setCurrentView("pokemon");
                            }}
                            className="text-blue-500"
                          >
                            <span className="pokeball mr-1"></span>
                            {t("pokemon")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-500 p-0 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-gray-500">{t("no-students-added-yet")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Pokémon management view
  if (currentView === "pokemon" && selectedSchoolId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedStudent(null);
                setCurrentView("students");
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back-to-students")}
            </Button>
            <h2 className="text-2xl font-bold ml-4">
              {selectedStudent 
                ? t("manage-student-pokemon", { name: selectedStudent.displayName || selectedStudent.name })
                : t("school-pokemon-pool")}
            </h2>
          </div>
        </div>
        
        {selectedStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="pokemon-card">
              <CardHeader>
                <CardTitle>{t("award-coins-to", { name: selectedStudent.displayName || selectedStudent.name })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      value={coinsToAward}
                      onChange={(e) => setCoinsToAward(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <Button onClick={handleAwardCoins} className="pokemon-button">
                    <Coins className="h-4 w-4 mr-1" />
                    {t("award-coins")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="pokemon-card">
              <CardHeader>
                <CardTitle>{t("remove-coins-from", { name: selectedStudent.displayName || selectedStudent.name })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      value={coinsToRemove}
                      onChange={(e) => setCoinsToRemove(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <Button onClick={handleRemoveCoins} variant="destructive">
                    <Coins className="h-4 w-4 mr-1" />
                    {t("remove-coins")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="pokemon-card col-span-full">
              <CardHeader>
                <CardTitle>{t("pokemon-management")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleRemovePokemon} variant="destructive" className="w-full">
                  <Award className="h-4 w-4 mr-1" />
                  {t("remove-random-pokemon")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pokemonPool.map(pokemon => (
            <Card key={pokemon.id} className="pokemon-card">
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 mx-auto mb-2">
                  <img 
                    src={pokemon.image} 
                    alt={pokemon.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <h3 className="font-bold">{pokemon.name}</h3>
                <p className="text-sm text-gray-500">{pokemon.type}</p>
                <p className="text-xs mb-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-white ${
                    pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                    pokemon.rarity === 'rare' ? 'bg-purple-500' :
                    pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {pokemon.rarity}
                  </span>
                </p>
                
                {selectedStudent && (
                  <Button 
                    onClick={() => handleAssignPokemon(pokemon.id)}
                    className="w-full pokemon-button"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    {t("assign-to-student")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          
          {pokemonPool.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p>{t("no-pokemon-available")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default ClassManagement;
