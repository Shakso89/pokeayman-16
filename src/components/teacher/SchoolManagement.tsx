
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { School } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { initializeSchoolPokemonPool } from "@/utils/pokemon";
import SchoolCard from "./school/SchoolCard";
import EmptySchoolState from "./school/EmptySchoolState";
import AddSchoolForm from "./school/AddSchoolForm";
import StudentPokemonDialog from "./school/StudentPokemonDialog";

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
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentPokemon, setStudentPokemon] = useState<any[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const { toast } = useToast();

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
        title: "error",
        description: "only-admin-can-create-schools",
        variant: "destructive",
      });
      return;
    }

    if (!newSchool.name.trim()) {
      toast({
        title: "error",
        description: "school-name-required",
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
        title: "error",
        description: "school-name-already-exists",
        variant: "destructive",
      });
      return;
    }

    const schoolId = `school-${Date.now()}`;
    const newSchoolData: School = {
      id: schoolId,
      name: newSchool.name,
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
      title: "success",
      description: "school-created",
    });
  };

  const handleUpdateSchool = (schoolId: string, newName: string) => {
    // Only admin can update schools
    if (!isAdminUser) {
      toast({
        title: "error",
        description: "only-admin-can-update-schools",
        variant: "destructive",
      });
      setEditingSchoolId(null);
      return;
    }

    if (!newName.trim()) {
      toast({
        title: "error",
        description: "school-name-required",
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
        title: "error",
        description: "school-name-already-exists",
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
      title: "success",
      description: "school-updated",
    });
  };

  const handleDeleteSchool = (schoolId: string) => {
    // Only admin can delete schools
    if (!isAdminUser) {
      toast({
        title: "error",
        description: "only-admin-can-delete-schools",
        variant: "destructive",
      });
      return;
    }

    // Check if school has classes
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const schoolClasses = parsedClasses.filter((cls: any) => cls.schoolId === schoolId);

    if (schoolClasses.length > 0) {
      toast({
        title: "error",
        description: "cannot-delete-school-with-classes",
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
      title: "success",
      description: "school-deleted",
    });
  };

  const handleViewStudentPokemon = (studentId: string) => {
    // Get student data
    const studentsData = localStorage.getItem("students");
    if (studentsData) {
      const students = JSON.parse(studentsData);
      const student = students.find((s: any) => s.id === studentId);
      
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
            back
          </Button>
          <h2 className="text-2xl font-bold">manage-schools</h2>
        </div>
      </div>
      
      {isAdminUser && (
        <AddSchoolForm 
          schoolName={newSchool.name}
          onSchoolNameChange={(name) => setNewSchool({ name })}
          onAddSchool={handleAddSchool}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            isAdmin={isAdminUser}
            editingSchoolId={editingSchoolId}
            onEditSchool={setEditingSchoolId}
            onUpdateSchool={handleUpdateSchool}
            onDeleteSchool={handleDeleteSchool}
            onSelectSchool={onSelectSchool}
          />
        ))}
        
        {schools.length === 0 && (
          <EmptySchoolState 
            isAdmin={isAdminUser} 
            onAddSchool={() => setNewSchool({ name: "" })} 
          />
        )}
      </div>

      <StudentPokemonDialog
        open={showStudentPokemon}
        onOpenChange={setShowStudentPokemon}
        student={selectedStudent}
        pokemon={studentPokemon}
      />
    </div>
  );
};

export default SchoolManagement;
