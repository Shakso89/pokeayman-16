import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Shuffle, User, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { getStudentPokemonCollection, removePokemonFromStudent, assignRandomPokemonToStudent, assignSpecificPokemonToStudent } from "@/utils/pokemon/studentPokemon";
import { SchoolPoolPokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

interface TeacherManagePokemonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: any[];
  schoolId: string;
  isClassCreator: boolean;
  onRefresh: () => void;
}

const TeacherManagePokemonDialog: React.FC<TeacherManagePokemonDialogProps> = ({
  isOpen,
  onOpenChange,
  students,
  schoolId,
  isClassCreator,
  onRefresh
}) => {
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentPokemons, setStudentPokemons] = useState<StudentCollectionPokemon[]>([]);
  const [schoolPool, setSchoolPool] = useState<SchoolPoolPokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"award" | "remove">("award");
  const [profileError, setProfileError] = useState<string|null>(null);

  useEffect(() => {
    if (isOpen && schoolId) {
      fetchSchoolPool();
    }
  }, [isOpen, schoolId]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentPokemons();
    }
  }, [selectedStudent]);

  const fetchSchoolPool = async () => {
    try {
      const poolData = await getSchoolPokemonPool(schoolId);
      setSchoolPool(poolData || []);
    } catch (error) {
      console.error("Error fetching school pool:", error);
      setSchoolPool([]);
    }
  };

  const fetchStudentPokemons = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setProfileError(null);

    try {
      // Try fetch (RLS-safe!)
      // Uses the updated getOrCreateStudentProfile (never creates, just checks)
      const collection = await getStudentPokemonCollection(selectedStudent.id);

      if (collection === null || (Array.isArray(collection) && collection.length === 0)) {
        // Need further check: does the student's profile exist at all?
        // Try a direct profile fetch to see if it's missing
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", selectedStudent.id)
          .maybeSingle();
        if (!profile) {
          setProfileError("This student does not yet have a profile in the system. Ask them to log in at least once before Pokémon can be assigned!");
          setStudentPokemons([]);
          setLoading(false);
          return;
        }
      }
      // No error: show Pokémon as normal
      setStudentPokemons(collection);
    } catch (error:any) {
      setProfileError("An error occurred loading this student's profile.");
      setStudentPokemons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardRandomPokemon = async () => {
    if (!selectedStudent || !isClassCreator) return;
    if (profileError) {
      toast({
        title: "No Profile",
        description: profileError,
        variant: "destructive"
      });
      return;
    }

    if (schoolPool.length === 0) {
      toast({
        title: t("error"),
        description: "No Pokémon available in school pool. Please refresh the pool or contact support.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await assignRandomPokemonToStudent(schoolId, selectedStudent.id);

      if (result && result.error === "profile_missing") {
        toast({
          title: t("error"),
          description: "Student does not have a profile. Ask them to log in at least once before assigning Pokémon.",
          variant: "destructive"
        });
      } else if (result && result.error === "empty_pool") {
        toast({
          title: t("error"),
          description: "No Pokémon left in school pool. Please refresh the pool.",
          variant: "destructive"
        });
      } else if (result && result.error) {
        toast({
          title: t("error"),
          description: `Failed to assign Pokémon: ${result.error}`,
          variant: "destructive"
        });
      } else if (result && result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} awarded to ${selectedStudent.display_name || selectedStudent.username}`
        });
        fetchStudentPokemons();
        fetchSchoolPool();
        onRefresh();
      } else {
        toast({
          title: t("error"),
          description: "Failed to award Pokémon. Unknown error.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error awarding pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokémon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAwardSpecificPokemon = async (pokemon: SchoolPoolPokemon) => {
    if (!selectedStudent || !isClassCreator) return;
    if (profileError) {
      toast({
        title: "No Profile",
        description: profileError,
        variant: "destructive"
      });
      return;
    }

    if (!pokemon.poolEntryId) {
      toast({
        title: t("error"),
        description: "Invalid pool entry selected.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await assignSpecificPokemonToStudent(
        pokemon.poolEntryId,
        pokemon.id,
        schoolId,
        selectedStudent.id
      );

      if (result && result.error === "profile_missing") {
        toast({
          title: t("error"),
          description: "Student does not have a profile. Ask them to log in at least once before assigning Pokémon.",
          variant: "destructive"
        });
      } else if (result && result.error) {
        toast({
          title: t("error"),
          description: `Failed to assign Pokémon: ${result.error}`,
          variant: "destructive"
        });
      } else if (result && result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} awarded to ${selectedStudent.display_name || selectedStudent.username}`
        });
        fetchStudentPokemons();
        fetchSchoolPool();
        onRefresh();
      } else {
        toast({
          title: t("error"),
          description: "Failed to award Pokémon. Unknown error.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error awarding pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokémon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePokemon = async (collectionId: string, pokemonName: string) => {
    if (!isClassCreator) return;
    if (profileError) {
      toast({
        title: "No Profile",
        description: profileError,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await removePokemonFromStudent(collectionId);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${pokemonName} removed and returned to school pool`
        });
        fetchStudentPokemons();
        fetchSchoolPool();
        onRefresh();
      } else {
        toast({
          title: t("error"),
          description: "Failed to remove Pokémon",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to remove Pokémon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRandomPokemon = async () => {
    if (!selectedStudent || !isClassCreator || studentPokemons.length === 0) return;

    const randomPokemon = studentPokemons[Math.floor(Math.random() * studentPokemons.length)];
    await handleRemovePokemon(randomPokemon.collectionId, randomPokemon.name);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-yellow-500";
      case "rare": return "bg-purple-500";
      case "uncommon": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (!selectedStudent) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Pokémon - Select Student</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">Select a student to manage their Pokémon:</p>
            
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{student.display_name || student.username}</p>
                        <p className="text-sm text-gray-500">@{student.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudent(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>
              Manage Pokémon - {selectedStudent.display_name || selectedStudent.username}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Action Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "award" ? "default" : "outline"}
              onClick={() => setActiveTab("award")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Award Pokémon
            </Button>
            <Button
              variant={activeTab === "remove" ? "default" : "outline"}
              onClick={() => setActiveTab("remove")}
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              Remove Pokémon
            </Button>
          </div>

          {activeTab === "award" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Award Pokémon from School Pool</h3>
                <Button
                  onClick={handleAwardRandomPokemon}
                  disabled={loading || schoolPool.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Award Random
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                {schoolPool.length} Pokémon available in school pool
              </p>
              
              {schoolPool.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No Pokémon available in school pool</p>
                  <p className="text-sm text-gray-400 mt-2">Please refresh the school pool or contact an administrator</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolPool.map((pokemon) => (
                    <Card key={pokemon.poolEntryId}>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center space-y-2">
                          <img 
                            src={pokemon.image} 
                            alt={pokemon.name}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <h4 className="font-semibold text-center text-sm">{pokemon.name}</h4>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">{pokemon.type}</Badge>
                            <Badge className={`text-white text-xs ${getRarityColor(pokemon.rarity)}`}>
                              {pokemon.rarity}
                            </Badge>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleAwardSpecificPokemon(pokemon)}
                            disabled={loading}
                            className="w-full mt-2"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Award
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "remove" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Remove Pokémon from Student</h3>
                <Button
                  onClick={handleRemoveRandomPokemon}
                  disabled={loading || studentPokemons.length === 0}
                  variant="destructive"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Remove Random
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                {studentPokemons.length} Pokémon in student's collection
              </p>
              
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading student's Pokémon...</p>
                </div>
              ) : studentPokemons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Student has no Pokémon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentPokemons.map((pokemon) => (
                    <Card key={pokemon.collectionId}>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center space-y-2">
                          <img 
                            src={pokemon.image} 
                            alt={pokemon.name}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <h4 className="font-semibold text-center text-sm">{pokemon.name}</h4>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">{pokemon.type}</Badge>
                            <Badge className={`text-white text-xs ${getRarityColor(pokemon.rarity)}`}>
                              {pokemon.rarity}
                            </Badge>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePokemon(pokemon.collectionId, pokemon.name)}
                            disabled={loading}
                            className="w-full mt-2"
                          >
                            <Minus className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {profileError ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg my-4">
              <strong>Notice:</strong> {profileError}
            </div>
          ) : null}
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherManagePokemonDialog;
