import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon, Student } from "@/types/pokemon";

// Import refactored components
import StudentProfile from "@/components/student/StudentProfile";
import PokemonList from "@/components/student/PokemonList";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import UploadPhotos from "@/components/profile/UploadPhotos";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [spentCoins, setSpentCoins] = useState<number>(0);
  const [ranking, setRanking] = useState<number | null>(null);
  
  // Dialog states
  const [isGiveCoinDialogOpen, setIsGiveCoinDialogOpen] = useState<boolean>(false);
  
  // Determine if viewer is the student or a teacher
  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const isOwnProfile = currentUserId === studentId && userType === "student";
  
  useEffect(() => {
    if (studentId) {
      loadStudentData(studentId);
      loadStudentPokemon(studentId);
      calculateRanking(studentId);
    }
  }, [studentId]);
  
  const loadStudentData = (id: string) => {
    setIsLoading(true);
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: Student) => s.id === id);
      
      if (student) {
        setStudent(student);
      } else {
        toast({
          title: t("error"),
          description: t("student-not-found"),
          variant: "destructive",
        });
        navigate("/teacher-dashboard");
      }
    } catch (error) {
      console.error("Error loading student:", error);
      toast({
        title: t("error"),
        description: t("error-loading-student"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStudentPokemon = (id: string) => {
    try {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const pokemonData = studentPokemons.find((p: any) => p.studentId === id);
      
      if (pokemonData) {
        setPokemons(pokemonData.pokemons || []);
        setCoins(pokemonData.coins || 0);
        
        // Calculate spent coins based on Pokemon collection
        const pokemonCost = (pokemonData.pokemons || []).length * 10; // Assuming each Pokemon costs 10 coins
        setSpentCoins(pokemonCost);
      } else {
        setPokemons([]);
        setCoins(0);
        setSpentCoins(0);
      }
    } catch (error) {
      console.error("Error loading student pokemon:", error);
    }
  };
  
  const calculateRanking = (id: string) => {
    try {
      // Get the student's school
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: Student) => s.id === id);
      
      if (!student || !student.schoolId) {
        setRanking(null);
        return;
      }
      
      // Get all students from same school
      const schoolStudents = students.filter((s: Student) => s.schoolId === student.schoolId);
      
      // Get their Pokemon counts
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithPokemonCount = schoolStudents.map((s: Student) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === s.id);
        const count = pokemonData ? (pokemonData.pokemons || []).length : 0;
        return { ...s, pokemonCount: count };
      });
      
      // Sort by Pokemon count
      const sortedStudents = studentsWithPokemonCount.sort((a: any, b: any) => 
        b.pokemonCount - a.pokemonCount
      );
      
      // Find our student's position
      const position = sortedStudents.findIndex((s: any) => s.id === id) + 1;
      setRanking(position);
      
    } catch (error) {
      console.error("Error calculating ranking:", error);
      setRanking(null);
    }
  };
  
  const handleGiveCoins = (coinAmount: number) => {
    if (!student) return;
    
    try {
      // Update studentPokemons in localStorage
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentIndex = studentPokemons.findIndex((p: any) => p.studentId === student.id);
      
      if (studentIndex !== -1) {
        studentPokemons[studentIndex].coins = (studentPokemons[studentIndex].coins || 0) + coinAmount;
        setCoins(studentPokemons[studentIndex].coins);
      } else {
        // Create new entry
        studentPokemons.push({
          studentId: student.id,
          pokemons: [],
          coins: coinAmount
        });
        setCoins(coinAmount);
      }
      
      localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
      
      toast({
        title: t("success"),
        description: t("coins-given-to-student")
      });
      
      setIsGiveCoinDialogOpen(false);
    } catch (error) {
      console.error("Error giving coins:", error);
      toast({
        title: t("error"),
        description: t("error-giving-coins"),
        variant: "destructive",
      });
    }
  };
  
  const handleRemovePokemon = (pokemon: Pokemon) => {
    if (!student) return;
    
    try {
      // Update studentPokemons in localStorage
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentIndex = studentPokemons.findIndex((p: any) => p.studentId === student.id);
      
      if (studentIndex !== -1 && studentPokemons[studentIndex].pokemons) {
        studentPokemons[studentIndex].pokemons = studentPokemons[studentIndex].pokemons.filter(
          (p: Pokemon) => p.id !== pokemon.id
        );
        setPokemons(studentPokemons[studentIndex].pokemons);
        
        localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
        
        toast({
          title: t("success"),
          description: t("pokemon-removed")
        });
      }
    } catch (error) {
      console.error("Error removing pokemon:", error);
      toast({
        title: t("error"),
        description: t("error-removing-pokemon"),
        variant: "destructive",
      });
    }
  };
  
  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  if (isLoading || !student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"} 
        userName={userType === "teacher" 
          ? localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername")
          : localStorage.getItem("studentName")
        } 
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">
            {student.displayName} 
            <span className="text-gray-500 ml-2 text-base">(@{student.username})</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <StudentProfile
            student={student}
            coins={coins}
            spentCoins={spentCoins}
            pokemonCount={pokemons.length}
            battlesCount={0}
            schoolRanking={ranking}
            onGiveCoins={() => setIsGiveCoinDialogOpen(true)}
          />
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="pokemon" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pokemon" className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  {t("pokemon")}
                </TabsTrigger>
                <TabsTrigger value="photos">
                  {t("photos")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pokemon">
                <Card>
                  <PokemonList 
                    pokemons={pokemons} 
                    onRemovePokemon={handleRemovePokemon}
                    onPokemonClick={handlePokemonClick}
                    isTeacherView={userType === "teacher"}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="photos">
                <Card className="p-6">
                  <UploadPhotos
                    userId={student.id}
                    userType="student"
                    isOwnProfile={isOwnProfile}
                    onPhotoClick={(url) => setSelectedPhoto(url)}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <GiveCoinsDialog
        open={isGiveCoinDialogOpen}
        onOpenChange={setIsGiveCoinDialogOpen}
        onGiveCoins={handleGiveCoins}
      />
      
      {/* Photo View Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>{t("photo")}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedPhoto} 
                alt="Enlarged" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Pokémon View Modal */}
      <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPokemon?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPokemon && (
            <div className="flex flex-col items-center p-4">
              <img 
                src={selectedPokemon.image} 
                alt={selectedPokemon.name}
                className="w-48 h-48 object-contain mb-4" 
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("type")}:</p>
                  <p>{selectedPokemon.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("rarity")}:</p>
                  <p>{selectedPokemon.rarity}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
