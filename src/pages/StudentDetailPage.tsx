
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Award, Sword } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon, Student } from "@/types/pokemon";

// Import refactored components
import StudentProfile from "@/components/student/StudentProfile";
import PokemonList from "@/components/student/PokemonList";
import BattleHistory from "@/components/student/BattleHistory";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [battles, setBattles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Dialog states
  const [isGiveCoinDialogOpen, setIsGiveCoinDialogOpen] = useState<boolean>(false);
  
  useEffect(() => {
    if (studentId) {
      loadStudentData(studentId);
      loadStudentPokemon(studentId);
      loadStudentBattles(studentId);
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
      } else {
        setPokemons([]);
        setCoins(0);
      }
    } catch (error) {
      console.error("Error loading student pokemon:", error);
    }
  };
  
  const loadStudentBattles = (id: string) => {
    try {
      const allBattles = JSON.parse(localStorage.getItem("battles") || "[]");
      const studentBattles = allBattles.filter((battle: any) => {
        // Find battles where the student participated
        return battle.participants.includes(id) || 
               battle.answers.some((answer: any) => answer.studentId === id) ||
               (battle.winner && battle.winner.studentId === id);
      });
      
      setBattles(studentBattles);
    } catch (error) {
      console.error("Error loading battles:", error);
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
        userType="teacher" 
        userName={localStorage.getItem("teacherUsername") || "Teacher"} 
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
            pokemonCount={pokemons.length}
            battlesCount={battles.length}
            onGiveCoins={() => setIsGiveCoinDialogOpen(true)}
          />
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="pokemon" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pokemon" className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  {t("pokemon")}
                </TabsTrigger>
                <TabsTrigger value="battles" className="flex items-center">
                  <Sword className="h-4 w-4 mr-2" />
                  {t("battle-history")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pokemon">
                <Card>
                  <PokemonList 
                    pokemons={pokemons} 
                    onRemovePokemon={handleRemovePokemon} 
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="battles">
                <Card>
                  <BattleHistory 
                    battles={battles} 
                    studentId={student.id} 
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
    </div>
  );
};

export default StudentDetailPage;
