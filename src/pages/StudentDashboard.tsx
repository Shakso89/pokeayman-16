import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Award, Coins, PlusCircle, MessageSquare, School, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getStudentPokemonCollection, 
  getSchoolPokemonPool,
  initializeSchoolPokemonPool
} from "@/utils/pokemon";
import { Pokemon, StudentPokemon } from "@/types/pokemon";
import PokemonWheel from "@/components/student/PokemonWheel";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentId = localStorage.getItem("studentId") || "";
  const classId = localStorage.getItem("studentClassId") || "";
  const schoolId = localStorage.getItem("studentSchoolId") || "";
  const { t } = useTranslation();
  
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState("collection");
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [wheelPokemon, setWheelPokemon] = useState<Pokemon[]>([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(false);
  
  useEffect(() => {
    console.log("StudentDashboard loaded with:", { studentId, classId, schoolId });
    
    if (studentId) {
      loadStudentData();
      loadActiveBattles();
    }
    
    if (schoolId) {
      loadSchoolPokemonPool();
    }
  }, [studentId, schoolId]);

  useEffect(() => {
    if (activeTab === "wheel") {
      loadWheelPokemon();
    }
  }, [activeTab]);
  
  const loadStudentData = () => {
    console.log("Loading student data for:", studentId);
    // Load Pokemon collection and coins
    const collection = getStudentPokemonCollection(studentId);
    console.log("Student collection:", collection);
    if (collection) {
      setStudentPokemons(collection.pokemons);
      setCoins(collection.coins);
    } else {
      setStudentPokemons([]);
      setCoins(0);
    }
    
    // Load avatar
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const student = students.find((s: any) => s.id === studentId);
    if (student && student.avatar) {
      setAvatar(student.avatar);
    }
  };
  
  const loadSchoolPokemonPool = () => {
    console.log("Loading school pokemon pool for:", schoolId);
    // Initialize the school pool if it doesn't exist
    const pool = initializeSchoolPokemonPool(schoolId);
    console.log("School pokemon pool:", pool);
    if (pool) {
      setSchoolPokemons(pool.availablePokemons);
    } else {
      setSchoolPokemons([]);
    }
  };

  const loadWheelPokemon = () => {
    if (!schoolId) return;
    
    setIsLoadingWheel(true);
    const pool = getSchoolPokemonPool(schoolId);
    
    if (pool && pool.availablePokemons.length > 0) {
      // Get random Pokémon from the school pool (up to 12)
      const availablePokemon = [...pool.availablePokemons];
      const wheelSelection = [];
      
      // Select up to 12 random Pokémon
      const MAX_WHEEL_POKEMON = 12;
      const selectionCount = Math.min(MAX_WHEEL_POKEMON, availablePokemon.length);
      
      if (selectionCount > 0) {
        for (let i = 0; i < selectionCount; i++) {
          const randomIndex = Math.floor(Math.random() * availablePokemon.length);
          wheelSelection.push(availablePokemon.splice(randomIndex, 1)[0]);
        }
        setWheelPokemon(wheelSelection);
      } else {
        setWheelPokemon([]);
      }
    } else {
      setWheelPokemon([]);
    }
    
    setIsLoadingWheel(false);
  };
  
  const loadActiveBattles = () => {
    if (!studentId || !classId || !schoolId) return;
    
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];
    
    // Filter battles relevant to this student
    const relevantBattles = allBattles.filter((battle: any) => {
      // School-wide or specific class
      const isRelevant = (battle.schoolId === schoolId && (!battle.classId || battle.classId === classId));
      // Active and not expired
      const isActive = battle.status === "active";
      const isNotExpired = new Date(battle.timeLimit).getTime() > Date.now();
      
      return isRelevant && isActive && isNotExpired;
    });
    
    setActiveBattles(relevantBattles);
  };
  
  const handlePokemonWon = (pokemon: Pokemon) => {
    console.log("Pokemon won:", pokemon);
    // Refresh data after pokemon is won
    loadStudentData();
    loadSchoolPokemonPool();
    loadWheelPokemon();
  };

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="student" 
        userName={studentName} 
        userAvatar={avatar || undefined}
      />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-red-400 to-red-500 text-white">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold mb-2 text-center md:text-left">Welcome, {studentName}!</h2>
            <div className="flex flex-col md:flex-row items-center justify-between md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                <span className="font-bold">{coins} Coins</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                  onClick={() => setShowSchoolPool(true)}
                >
                  <School className="h-4 w-4" />
                  {t("school-pokemon-pool") || "School Pokémon Pool"}
                </Button>
                
                {activeBattles.length > 0 && (
                  <Button 
                    className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                    onClick={() => navigate("/student/battles")}
                  >
                    <Sword className="h-4 w-4" />
                    {t("active-battles") || "Active Battles"} ({activeBattles.length})
                  </Button>
                )}
                
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                  onClick={() => navigate("/student/messages")}
                >
                  <MessageSquare className="h-4 w-4" />
                  {t("messages") || "Messages"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collection" className="text-lg">My Collection</TabsTrigger>
            <TabsTrigger value="wheel" className="text-lg">Pokémon Wheel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="collection">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {studentPokemons.length > 0 ? (
                studentPokemons.map(pokemon => (
                  <Card key={pokemon.id} className="pokemon-card overflow-visible">
                    <div className="relative w-full">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <img 
                          src={pokemon.image} 
                          alt={pokemon.name} 
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                    </div>
                    <CardContent className="pt-10 pb-4 text-center">
                      <h3 className="font-bold text-lg">{pokemon.name}</h3>
                      <p className="text-sm text-gray-500">{pokemon.type}</p>
                      <p className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                          pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                          pokemon.rarity === 'rare' ? 'bg-purple-500' :
                          pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {pokemon.rarity}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full border-dashed">
                  <CardContent className="p-8 text-center">
                    <PlusCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Pokémon Yet</h3>
                    <p className="text-gray-500">Use the Pokémon Wheel to get your first Pokémon!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="wheel">
            <Card className="mx-auto max-w-xl shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-md">
                <CardTitle className="text-2xl">Pokémon Wheel</CardTitle>
                <CardDescription className="text-white opacity-90">
                  Spend 1 coin to spin the wheel and win a Pokémon!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {wheelPokemon.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="mb-4 text-lg text-gray-700">No available Pokémon</p>
                    <Button
                      onClick={loadWheelPokemon}
                      className="mx-auto flex items-center gap-2"
                      disabled={isLoadingWheel}
                    >
                      <RotateCw className="h-4 w-4" />
                      {isLoadingWheel ? "Checking..." : "Check Availability"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <PokemonWheel 
                      studentId={studentId} 
                      classId={classId}
                      coins={coins}
                      onPokemonWon={handlePokemonWon}
                      wheelPokemons={wheelPokemon}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* School Pokémon Pool Dialog */}
      <Dialog open={showSchoolPool} onOpenChange={setShowSchoolPool}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("school-pokemon-pool") || "School Pokémon Pool"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between mb-4 items-center">
              <p className="text-sm font-medium">
                {t("available-pokemon") || "Available Pokémon"}: {schoolPokemons.length}
              </p>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[70vh] overflow-y-auto p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              {schoolPokemons.slice(0, 96).map((pokemon) => (
                <div key={pokemon.id} className="text-center group hover-scale">
                  <div className={`bg-white p-2 rounded-lg shadow-sm border-2 ${
                    pokemon.rarity === 'legendary' ? 'border-yellow-500 hover:border-yellow-400' :
                    pokemon.rarity === 'rare' ? 'border-purple-500 hover:border-purple-400' :
                    pokemon.rarity === 'uncommon' ? 'border-blue-500 hover:border-blue-400' : 
                    'border-green-500 hover:border-green-400'
                  } transition-all duration-200 transform hover:scale-105`}>
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name} 
                      className="w-16 h-16 object-contain mx-auto" 
                    />
                    <div className="mt-1 p-1 bg-gray-100 rounded-md">
                      <p className="text-xs font-medium truncate">{pokemon.name}</p>
                      <p className="text-xs text-gray-500">{pokemon.type}</p>
                      <span className={`inline-block px-1 py-0.5 rounded-full text-[10px] text-white ${
                        pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                        pokemon.rarity === 'rare' ? 'bg-purple-500' :
                        pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {pokemon.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {schoolPokemons.length > 96 && (
                <div className="col-span-full text-center py-4 text-gray-500 text-sm bg-white/50 rounded-lg">
                  {t("and-more-pokemon", { count: schoolPokemons.length - 96 }) || 
                    `And ${schoolPokemons.length - 96} more Pokémon...`
                  }
                </div>
              )}
              
              {schoolPokemons.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {t("no-pokemon-in-pool") || "No Pokémon available in the school pool."}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
