
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Class, Student } from "@/types/pokemon";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Edit, Trash2, School as SchoolIcon, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initializeSchoolPokemonPool } from "@/utils/pokemon";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SchoolManagementProps {
  onBack: () => void;
  onSelectSchool: (schoolId: string) => void;
  teacherId: string;
}

// Predefined school names
const PREDEFINED_SCHOOLS = ["Daya", "Betuin", "Tanzi", "Dali", "Renmei", "New School"];

const SchoolManagement: React.FC<SchoolManagementProps> = ({ onBack, onSelectSchool, teacherId }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [newSchool, setNewSchool] = useState({
    name: "",
  });
  const [showStudentPokemon, setShowStudentPokemon] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPokemon, setStudentPokemon] = useState<any[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const { t } = useTranslation();

  useEffect(() => {
    // Check if current user is admin
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdminUser(username === "Admin");
    
    // Load all schools
    const savedSchools = localStorage.getItem("schools");
    let parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    
    // Initialize predefined schools if they don't exist or reset them to predefined values
    if (isAdminUser) {
      // First check if we should reset the schools
      const shouldReset = parsedSchools.length === 0 || 
        parsedSchools.some((school: School) => !PREDEFINED_SCHOOLS.includes(school.name)) ||
        PREDEFINED_SCHOOLS.some(name => !parsedSchools.find((school: School) => school.name === name));
      
      if (shouldReset) {
        // Remove all existing schools
        localStorage.removeItem("schools");
        
        // Create the predefined schools
        const initialSchools = PREDEFINED_SCHOOLS.map((name, index) => {
          const schoolId = `school-${Date.now()}-${index}`;
          const newSchool: School = {
            id: schoolId,
            name,
            teacherId, // Set admin as creator
            createdAt: new Date().toISOString(),
          };
          
          // Initialize Pokemon pool for the new school
          initializeSchoolPokemonPool(schoolId);
          
          return newSchool;
        });
        
        // Save predefined schools
        localStorage.setItem("schools", JSON.stringify(initialSchools));
        parsedSchools = initialSchools;
      }
    }
    
    // Admin sees all schools, teachers see only their schools
    const visibleSchools = isAdminUser 
      ? parsedSchools 
      : parsedSchools;
    
    setSchools(visibleSchools);
  }, [teacherId, isAdminUser]);

  const handleAddSchool = () => {
    // Only admin can create schools
    if (!isAdminUser) {
      toast({
        title: t("error"),
        description: t("only-admin-can-create-schools"),
        variant: "destructive",
      });
      return;
    }

    if (!newSchool.name.trim()) {
      toast({
        title: t("error"),
        description: t("school-name-required"),
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate school name
    const duplicateSchool = schools.find(school => 
      school.name.toLowerCase() === newSchool.name.trim().toLowerCase()
    );
    
    if (duplicateSchool) {
      toast({
        title: t("error"),
        description: t("school-name-already-exists"),
        variant: "destructive",
      });
      return;
    }

    const schoolId = `school-${Date.now()}`;
    const newSchoolData: School = {
      id: schoolId,
      name: newSchool.name,
      teacherId, // Set current teacher as creator
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedSchools = localStorage.getItem("schools");
    const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    parsedSchools.push(newSchoolData);
    localStorage.setItem("schools", JSON.stringify(parsedSchools));

    // Update local state
    setSchools([...schools, newSchoolData]);
    setNewSchool({ name: "" });
    
    // Initialize Pokemon pool for the new school
    initializeSchoolPokemonPool(schoolId);

    toast({
      title: t("success"),
      description: t("school-created"),
    });
  };

  const handleUpdateSchool = (schoolId: string, newName: string) => {
    // Only admin can update schools
    if (!isAdminUser) {
      toast({
        title: t("error"),
        description: t("only-admin-can-update-schools"),
        variant: "destructive",
      });
      setEditingSchoolId(null);
      return;
    }

    if (!newName.trim()) {
      toast({
        title: t("error"),
        description: t("school-name-required"),
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate school name
    const duplicateSchool = schools.find(school => 
      school.name.toLowerCase() === newName.trim().toLowerCase() && school.id !== schoolId
    );
    
    if (duplicateSchool) {
      toast({
        title: t("error"),
        description: t("school-name-already-exists"),
        variant: "destructive",
      });
      return;
    }

    // Update school in localStorage
    const savedSchools = localStorage.getItem("schools");
    const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    const updatedSchools = parsedSchools.map((school: School) =>
      school.id === schoolId ? { ...school, name: newName } : school
    );
    localStorage.setItem("schools", JSON.stringify(updatedSchools));

    // Update local state
    setSchools(schools.map(school => 
      school.id === schoolId ? { ...school, name: newName } : school
    ));
    setEditingSchoolId(null);

    toast({
      title: t("success"),
      description: t("school-updated"),
    });
  };

  const handleDeleteSchool = (schoolId: string) => {
    // Only admin can delete schools
    if (!isAdminUser) {
      toast({
        title: t("error"),
        description: t("only-admin-can-delete-schools"),
        variant: "destructive",
      });
      return;
    }

    // Check if school has classes
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const schoolClasses = parsedClasses.filter((cls: Class) => cls.schoolId === schoolId);

    if (schoolClasses.length > 0) {
      toast({
        title: t("error"),
        description: t("cannot-delete-school-with-classes"),
        variant: "destructive",
      });
      return;
    }

    // Delete school from localStorage
    const savedSchools = localStorage.getItem("schools");
    const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    const updatedSchools = parsedSchools.filter((school: School) => school.id !== schoolId);
    localStorage.setItem("schools", JSON.stringify(updatedSchools));

    // Update local state
    setSchools(schools.filter(school => school.id !== schoolId));

    toast({
      title: t("success"),
      description: t("school-deleted"),
    });
  };

  const handleViewStudentPokemon = (studentId: string) => {
    // Get student data
    const studentsData = localStorage.getItem("students");
    if (studentsData) {
      const students = JSON.parse(studentsData);
      const student = students.find((s: Student) => s.id === studentId);
      
      if (student) {
        setSelectedStudent(student);
        
        // Get student pokemon data
        const pokemonData = localStorage.getItem("studentPokemons");
        if (pokemonData) {
          const pokemons = JSON.parse(pokemonData);
          const studentPokemons = pokemons.find((p: any) => p.studentId === studentId)?.pokemons || [];
          setStudentPokemon(studentPokemons);
        } else {
          setStudentPokemon([]);
        }
        
        setShowStudentPokemon(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h2 className="text-2xl font-bold">{t("manage-schools")}</h2>
        </div>
      </div>
      
      {isAdminUser && (
        <Card className="pokemon-card">
          <CardHeader>
            <CardTitle>{t("add-new-school")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder={t("school-name")}
                value={newSchool.name}
                onChange={(e) => setNewSchool({ name: e.target.value })}
              />
              <Button onClick={handleAddSchool}>
                <Plus className="h-4 w-4 mr-1" />
                {t("add-school")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => (
          <Card key={school.id} className="pokemon-card hover:shadow-md transition-shadow">
            {editingSchoolId === school.id ? (
              <CardContent className="pt-6">
                <Input
                  defaultValue={school.name}
                  autoFocus
                  onBlur={(e) => handleUpdateSchool(school.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateSchool(school.id, e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setEditingSchoolId(null);
                    }
                  }}
                />
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <SchoolIcon className="h-5 w-5 text-blue-500" />
                      {school.name}
                    </CardTitle>
                    {isAdminUser && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSchoolId(school.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {school.name === "New School" && (
                    <Alert className="mb-3 bg-amber-50">
                      <AlertDescription>
                        {t("contact-admin-after-creating-classes")}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => onSelectSchool(school.id)}
                  >
                    {t("manage-classes")}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        ))}
        
        {schools.length === 0 && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-8 text-center">
              <SchoolIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">{t("no-schools-yet")}</h3>
              <p className="text-gray-500 mb-6">
                {isAdminUser 
                  ? t("create-first-school-description")
                  : t("no-schools-assigned")}
              </p>
              {isAdminUser && (
                <Button onClick={() => setNewSchool({ name: "" })}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("create-first-school")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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

export default SchoolManagement;
