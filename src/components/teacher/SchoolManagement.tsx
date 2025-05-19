import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Class, Student } from "@/types/pokemon";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Edit, Trash2, School as SchoolIcon, Eye, Trash, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { initializeSchoolPokemonPool } from "@/utils/pokemon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
  const [showDeleteClassDialog, setShowDeleteClassDialog] = useState(false);
  const [classesToDelete, setClassesToDelete] = useState<Class[]>([]);
  const [selectedSchoolForDeletion, setSelectedSchoolForDeletion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { t } = useTranslation();

  useEffect(() => {
    // Check if current user is admin - ensure Ayman is always an admin
    const username = localStorage.getItem("teacherUsername") || "";
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
    setIsAdminUser(
      username === "Admin" || 
      username === "Ayman" || 
      userEmail === "ayman.soliman.tr@gmail.com" || 
      userEmail === "ayman.soliman.cc@gmail.com"
    );
    
    // Load schools from Supabase
    loadSchools();
    
    // Subscribe to realtime updates for schools
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools'
        },
        (payload) => {
          console.log('School change detected:', payload);
          loadSchools();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacherId]);
  
  // Function to load schools from Supabase
  const loadSchools = async () => {
    setIsLoading(true);
    try {
      // Get schools from Supabase
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // If admin and no schools exist, create predefined schools
      if (isAdminUser && (!schoolsData || schoolsData.length === 0)) {
        await createPredefinedSchools();
        return; // loadSchools will be called again by the subscription
      }
      
      setSchools(schoolsData || []);
    } catch (error) {
      console.error("Error loading schools:", error);
      
      // Fallback to localStorage
      const savedSchools = localStorage.getItem("schools");
      const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
      setSchools(parsedSchools);
      
      toast({
        title: "Error",
        description: "Failed to load schools from database, using local data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create predefined schools if they don't exist
  const createPredefinedSchools = async () => {
    try {
      for (const schoolName of PREDEFINED_SCHOOLS) {
        // Check if school already exists
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('name', schoolName)
          .maybeSingle();
          
        if (!existingSchool) {
          const schoolId = crypto.randomUUID();
          
          // Create school in Supabase
          await supabase
            .from('schools')
            .insert({
              id: schoolId,
              name: schoolName,
              created_by: teacherId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          // Initialize Pokemon pool for the new school
          initializeSchoolPokemonPool(schoolId);
        }
      }
      
      // Load schools again after creating predefined ones
      loadSchools();
    } catch (error) {
      console.error("Error creating predefined schools:", error);
      toast({
        title: "Error",
        description: "Failed to create predefined schools.",
        variant: "destructive",
      });
    }
  };

  const handleAddSchool = async () => {
    // Modified to ensure Ayman can add schools
    const username = localStorage.getItem("teacherUsername") || "";
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
    const isAdmin = 
      username === "Admin" || 
      username === "Ayman" || 
      userEmail === "ayman.soliman.tr@gmail.com" || 
      userEmail === "ayman.soliman.cc@gmail.com";
      
    // Only admin can create schools
    if (!isAdmin) {
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

    const schoolId = crypto.randomUUID();
    
    try {
      // Create school in Supabase
      const { error } = await supabase
        .from('schools')
        .insert({
          id: schoolId,
          name: newSchool.name,
          created_by: teacherId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Initialize Pokemon pool for the new school
      initializeSchoolPokemonPool(schoolId);

      // Reset input field
      setNewSchool({ name: "" });
      
      toast({
        title: t("success"),
        description: t("school-created"),
      });
      
      // The subscription will reload the schools
    } catch (error: any) {
      console.error("Error creating school:", error);
      
      toast({
        title: t("error"),
        description: error.message || t("failed-to-create-school"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateSchool = async (schoolId: string, newName: string) => {
    // Modified to ensure Ayman can update schools
    const username = localStorage.getItem("teacherUsername") || "";
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
    const isAdmin = 
      username === "Admin" || 
      username === "Ayman" || 
      userEmail === "ayman.soliman.tr@gmail.com" || 
      userEmail === "ayman.soliman.cc@gmail.com";
      
    // Only admin can update schools
    if (!isAdmin) {
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

    try {
      // Update school in Supabase
      const { error } = await supabase
        .from('schools')
        .update({ 
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId);
        
      if (error) throw error;
      
      setEditingSchoolId(null);

      toast({
        title: t("success"),
        description: t("school-updated"),
      });
      
      // The subscription will reload the schools
    } catch (error: any) {
      console.error("Error updating school:", error);
      
      toast({
        title: t("error"),
        description: error.message || t("failed-to-update-school"),
        variant: "destructive",
      });
      
      setEditingSchoolId(null);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    // Modified to ensure Ayman can delete schools
    const username = localStorage.getItem("teacherUsername") || "";
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
    const isAdmin = 
      username === "Admin" || 
      username === "Ayman" || 
      userEmail === "ayman.soliman.tr@gmail.com" || 
      userEmail === "ayman.soliman.cc@gmail.com";
      
    // Only admin can delete schools
    if (!isAdmin) {
      toast({
        title: t("error"),
        description: t("only-admin-can-delete-schools"),
        variant: "destructive",
      });
      return;
    }

    // Check if school has classes
    try {
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      if (classes && classes.length > 0) {
        // Show delete class dialog
        setClassesToDelete(classes);
        setSelectedSchoolForDeletion(schoolId);
        setShowDeleteClassDialog(true);
        return;
      }
      
      // If school has no classes, delete it directly
      await deleteSchoolAndClasses(schoolId, []);
    } catch (error: any) {
      console.error("Error checking for classes:", error);
      
      toast({
        title: t("error"),
        description: error.message || t("failed-to-check-classes"),
        variant: "destructive",
      });
    }
  };

  const deleteSchoolAndClasses = async (schoolId: string, classesToDelete: Class[]) => {
    try {
      // Delete classes if any
      if (classesToDelete.length > 0) {
        // Reset student class_id associations
        for (const cls of classesToDelete) {
          // Get students in this class
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('class_id', cls.id);
            
          if (students && students.length > 0) {
            // Update students to remove class association
            await supabase
              .from('students')
              .update({ class_id: null })
              .in('id', students.map((s: any) => s.id));
          }
          
          // Delete the class
          await supabase
            .from('classes')
            .delete()
            .eq('id', cls.id);
        }
      }

      // Delete school from Supabase
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
        
      if (error) throw error;

      toast({
        title: t("success"),
        description: t("school-deleted"),
      });
      
      // Close dialog if open
      if (showDeleteClassDialog) {
        setShowDeleteClassDialog(false);
        setSelectedSchoolForDeletion(null);
        setClassesToDelete([]);
      }
      
      // The subscription will reload the schools
    } catch (error: any) {
      console.error("Error deleting school:", error);
      
      toast({
        title: t("error"),
        description: error.message || t("failed-to-delete-school"),
        variant: "destructive",
      });
    }
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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>{t("loading-schools")}</p>
        </div>
      ) : (
        <>
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
        </>
      )}

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

      {/* Delete Class Dialog */}
      <Dialog open={showDeleteClassDialog} onOpenChange={setShowDeleteClassDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {t("delete-classes")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">{t("delete-classes-warning")}</p>
            
            {classesToDelete.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                {classesToDelete.map((cls) => (
                  <div key={cls.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{cls.name}</span>
                    <Trash className="h-4 w-4 text-red-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6">{t("no-classes")}</p>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowDeleteClassDialog(false)}>
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedSchoolForDeletion) {
                  deleteSchoolAndClasses(selectedSchoolForDeletion, classesToDelete);
                }
              }}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement;
