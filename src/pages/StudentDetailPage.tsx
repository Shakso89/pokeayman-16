import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Coins, Gift, Trash2, Eye, Award, Sword } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon, Student } from "@/types/pokemon";
import PokemonSelectList from "@/components/pokemon/PokemonSelectList";

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
  const [isGivePokemonDialogOpen, setIsGivePokemonDialogOpen] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(10);
  const [availablePokemons, setAvailablePokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  
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
  
  const loadAvailablePokemons = () => {
    try {
      // Get school pokemon pool if student has schoolId
      if (student?.schoolId) {
        const pokemonPools = JSON.parse(localStorage.getItem("pokemonPools") || "[]");
        const schoolPool = pokemonPools.find((p: any) => p.schoolId === student.schoolId);
        if (schoolPool) {
          setAvailablePokemons(schoolPool.availablePokemons || []);
          return;
        }
      }
      
      // Fallback to default pokemon
      const defaultPokemon: Pokemon[] = [
        {
          id: "pokemon-1",
          name: "Pikachu",
          image: "/placeholder.svg",
          type: "Electric",
          rarity: "common"
        },
        {
          id: "pokemon-2",
          name: "Charmander",
          image: "/placeholder.svg",
          type: "Fire",
          rarity: "common"
        },
        {
          id: "pokemon-3",
          name: "Squirtle",
          image: "/placeholder.svg",
          type: "Water",
          rarity: "common"
        }
      ];
      setAvailablePokemons(defaultPokemon);
    } catch (error) {
      console.error("Error loading available pokemon:", error);
    }
  };
  
  const handleGiveCoins = () => {
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
  
  const handleGivePokemon = () => {
    if (!student || !selectedPokemon) return;
    
    try {
      // Update studentPokemons in localStorage
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentIndex = studentPokemons.findIndex((p: any) => p.studentId === student.id);
      
      if (studentIndex !== -1) {
        studentPokemons[studentIndex].pokemons = [
          ...(studentPokemons[studentIndex].pokemons || []),
          selectedPokemon
        ];
        setPokemons(studentPokemons[studentIndex].pokemons);
      } else {
        // Create new entry
        studentPokemons.push({
          studentId: student.id,
          pokemons: [selectedPokemon],
          coins: 0
        });
        setPokemons([selectedPokemon]);
      }
      
      localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
      
      toast({
        title: t("success"),
        description: t("pokemon-given-to-student")
      });
      
      setSelectedPokemon(null);
      setIsGivePokemonDialogOpen(false);
    } catch (error) {
      console.error("Error giving pokemon:", error);
      toast({
        title: t("error"),
        description: t("error-giving-pokemon"),
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
  
  const handleOpenGivePokemon = () => {
    loadAvailablePokemons();
    setIsGivePokemonDialogOpen(true);
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
          <Card className="col-span-1 pokemon-card">
            <CardHeader>
              <CardTitle>{t("student-profile")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("display-name")}:</p>
                  <p>{student.displayName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("username")}:</p>
                  <p>{student.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("coins")}:</p>
                  <p>{coins}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("pokemon-count")}:</p>
                  <p>{pokemons.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("battles-participated")}:</p>
                  <p>{battles.length}</p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full flex items-center"
                    onClick={() => setIsGiveCoinDialogOpen(true)}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {t("give-coins")}
                  </Button>
                  
                  <Button
                    className="w-full flex items-center"
                    onClick={handleOpenGivePokemon}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    {t("give-pokemon")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                  <CardHeader>
                    <CardTitle>{t("student-pokemon")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pokemons.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {pokemons.map((pokemon) => (
                          <div key={pokemon.id} className="bg-white rounded-lg p-4 shadow-sm text-center relative group">
                            <img 
                              src={pokemon.image || "/placeholder.svg"} 
                              alt={pokemon.name} 
                              className="w-24 h-24 mx-auto object-contain" 
                            />
                            <p className="mt-2 font-medium">{pokemon.name}</p>
                            <p className="text-sm text-gray-500">{pokemon.type}</p>
                            <p className="text-xs text-gray-500 capitalize">{pokemon.rarity}</p>
                            
                            <button 
                              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemovePokemon(pokemon)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">{t("no-pokemon-yet")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="battles">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("battle-history")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {battles.length > 0 ? (
                      <div className="space-y-4">
                        {battles.map((battle) => (
                          <div key={battle.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{battle.name}</h3>
                                <p className="text-sm text-gray-500">{battle.description}</p>
                              </div>
                              <div className="px-2 py-1 text-xs rounded-full capitalize" 
                                style={{ 
                                  backgroundColor: battle.status === 'completed' ? '#D1FAE5' : 
                                                 battle.status === 'active' ? '#DBEAFE' : '#FEF3C7',
                                  color: battle.status === 'completed' ? '#065F46' : 
                                         battle.status === 'active' ? '#1E40AF' : '#9A3412'
                                }}
                              >
                                {battle.status}
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <p>
                                <span className="text-gray-500">{t("reward")}: </span>
                                {battle.baseReward} {t("coins")}
                              </p>
                              
                              {battle.status === 'completed' && battle.winner?.studentId === student.id && (
                                <p className="text-green-600 font-medium">{t("winner")}</p>
                              )}
                              
                              {battle.status === 'completed' && battle.winner?.studentId !== student.id && (
                                <p className="text-gray-500">{t("participated")}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">{t("no-battles-yet")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Give Coins Dialog */}
      <Dialog open={isGiveCoinDialogOpen} onOpenChange={setIsGiveCoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("give-coins-to-student")}</DialogTitle>
            <DialogDescription>
              {t("give-coins-description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coins">{t("coin-amount")}</Label>
              <Input
                id="coins"
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGiveCoinDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleGiveCoins}>
              {t("give-coins")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Give Pokemon Dialog */}
      <Dialog open={isGivePokemonDialogOpen} onOpenChange={setIsGivePokemonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("give-pokemon-to-student")}</DialogTitle>
            <DialogDescription>
              {t("give-pokemon-description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {availablePokemons.map((pokemon) => (
                <div 
                  key={pokemon.id}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    selectedPokemon?.id === pokemon.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPokemon(pokemon)}
                >
                  <img 
                    src={pokemon.image || "/placeholder.svg"} 
                    alt={pokemon.name} 
                    className="w-16 h-16 mx-auto object-contain" 
                  />
                  <p className="mt-2 text-sm font-medium">{pokemon.name}</p>
                  <p className="text-xs text-gray-500">{pokemon.type}</p>
                  <p className="text-xs text-gray-500 capitalize">{pokemon.rarity}</p>
                </div>
              ))}
              
              {availablePokemons.length === 0 && (
                <div className="col-span-full text-center py-6">
                  <p className="text-gray-500">{t("no-available-pokemon")}</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedPokemon(null);
              setIsGivePokemonDialogOpen(false);
            }}>
              {t("cancel")}
            </Button>
            <Button onClick={handleGivePokemon} disabled={!selectedPokemon}>
              {t("give-pokemon")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
