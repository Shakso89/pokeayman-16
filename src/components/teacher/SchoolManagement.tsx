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

// Predefined schools
const PREDEFINED_SCHOOLS = ["Daya", "Betuin", "Tanzi", "Dali", "Renmai", "Other School"];

// Admin emails that should always have admin access
const ADMIN_EMAILS = [
  "ayman.soliman.tr@gmail.com",
  "ayman.soliman.cc@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

// Admin usernames that should always have admin access
const ADMIN_USERNAMES = ["Admin", "Ayman"];

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
  const [createSchoolLoading, setCreateSchoolLoading] = useState(false);
  
  const { t } = useTranslation();

  // Check if user is admin
  const checkAdminStatus = () => {
    const username = localStorage.getItem("teacherUsername") || "";
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
    const isAdminFlag = localStorage.getItem("isAdmin") === "true";
    
    const isAdmin = isAdminFlag || 
                    ADMIN_USERNAMES.includes(username) || 
                    ADMIN_EMAILS.includes(userEmail);
    
    console.log("Admin status check:", { username, userEmail, isAdminFlag, result: isAdmin });
    
    return isAdmin;
  };

  useEffect(() => {
    // Check if current user is admin
    setIsAdminUser(checkAdminStatus());
    
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
  
  // Load schools from database
  const loadSchools = async () => {
    setIsLoading(true);
    try {
      console.log("Loading schools...");
      // Get schools from Supabase
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      console.log("Schools data from Supabase:", schoolsData);
      
      // If no schools exist, create predefined schools for admin users
      if (!schoolsData || schoolsData.length === 0) {
        if (checkAdminStatus()) {
          console.log("No schools found, creating predefined schools as admin");
          await createPredefinedSchools();
          return; // loadSchools will be called again by the subscription
        }
      }
      
      setSchools(schoolsData || []);
    } catch (error) {
      console.error("Error loading schools:", error);
      
      // Fallback to localStorage
      const savedSchools = localStorage.getItem("schools");
      const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
      console.log("Fallback to localStorage schools:", parsedSchools);
      setSchools(parsedSchools);
      
      toast({
        title: "Error",
        description: "Failed to load schools from database, using local data.",
        variant: "destructive",
      });
      
      // If admin and no schools, try to create them
      if (parsedSchools.length === 0 && checkAdminStatus()) {
        createPredefinedSchools();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create predefined schools if they don't exist
  const createPredefinedSchools = async () => {
    try {
      const createdSchools = [];
      
      for (const schoolName of PREDEFINED_SCHOOLS) {
        try {
          // Check if school already exists
          const { data: existingSchool } = await supabase
            .from('schools')
            .select('id')
            .eq('name', schoolName)
            .maybeSingle();
            
          if (!existingSchool) {
            const schoolId = crypto.randomUUID();
            
            // Create school in Supabase - set created_by to null if teacherId is not available
            const { data, error } = await supabase
              .from('schools')
              .insert({
                id: schoolId,
                name: schoolName,
                created_by: null, // Allow null to bypass foreign key constraint
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select();
              
            if (error) {
              console.error(`Error creating school ${schoolName}:`, error);
            } else if (data) {
              console.log(`Created school ${schoolName}:`, data[0]);
              createdSchools.push(data[0]);
              
              // Initialize Pokemon pool for the new school
              initializeSchoolPokemonPool(schoolId);
            }
          }
        } catch (schoolError) {
          console.error(`Error processing school ${schoolName}:`, schoolError);
        }
      }
      
      if (createdSchools.length > 0) {
        toast({
          title: "Schools created",
          description: `Created ${createdSchools.length} predefined schools.`,
        });
        
        // Update local state with new schools
        setSchools(prev => [...prev, ...createdSchools]);
      }
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
    // Double-check if user is admin
    if (!checkAdminStatus()) {
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
    setCreateSchoolLoading(true);
    
    try {
      console.log("Creating school with ID:", schoolId);
      
      // Create school in Supabase - set created_by to null if teacherId is not available
      const { data, error } = await supabase
        .from('schools')
        .insert({
          id: schoolId,
          name: newSchool.name,
          created_by: null, // Allow null to bypass foreign key constraint
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error("Error creating school:", error);
        throw error;
      }
      
      console.log("School created successfully:", data);
      
      // Initialize Pokemon pool for the new school
      initializeSchoolPokemonPool(schoolId);

      // Reset input field
      setNewSchool({ name: "" });
      
      // Add to local state (subscription will refresh anyway)
      if (data && data[0]) {
        setSchools(prev => [...prev, data[0]]);
      }
      
      toast({
        title: t("success"),
        description: t("school-created"),
      });
    } catch (error: any) {
      console.error("Error creating school:", error);
      
      toast({
        title: t("error"),
        description: error.message || t("failed-to-create-school"),
        variant: "destructive",
      });
    } finally {
      setCreateSchoolLoading(false);
    }
  };

  // Update school name
  const handleUpdateSchool = async (schoolId: string, newName: string) => {
    // Double-check if user is admin
    if (!checkAdminStatus()) {
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
      console.log("Updating school:", schoolId, "with new name:", newName);
      // Update school in Supabase
      const { data, error } = await supabase
        .from('schools')
        .update({ 
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)
        .select();
        
      if (error) throw error;
      
      console.log("School updated successfully:", data);
      
      // Update local state
      if (data && data[0]) {
        setSchools(prev => 
          prev.map(school => school.id === schoolId ? data[0] : school)
        );
      }
      
      setEditingSchoolId(null);

      toast({
        title: t("success"),
        description: t("school-updated"),
      });
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
    // Double-check if user is admin
    if (!checkAdminStatus()) {
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
      
      // Update local state
      setSchools(prev => prev.filter(school => school.id !== schoolId));

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
      
      {/* Admin check info - helpful for debugging */}
      {isAdminUser ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription>
            You are logged in as an admin user with full school management permissions.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription>
            You need admin privileges to create or modify schools.
          </AlertDescription>
        </Alert>
      )}
      
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
                  <Button 
                    onClick={handleAddSchool}
                    disabled={createSchoolLoading}
                  >
                    {createSchoolLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
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
                      {/* Show alert for "Other School" indicating to contact admin */}
                      {school.name === "Other School" && (
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
