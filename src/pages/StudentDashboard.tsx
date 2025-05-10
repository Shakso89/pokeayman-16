import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Award, Coins, PlusCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getStudentPokemonCollection, 
  getSchoolPokemonPool,
  initializeSchoolPokemonPool
} from "@/utils/pokemonData";
import { Pokemon, StudentPokemon } from "@/types/pokemon";
import PokemonWheel from "@/components/student/PokemonWheel";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

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
  
  useEffect(() => {
    if (studentId) {
      loadStudentData();
      loadActiveBattles();
    }
    
    if (schoolId) {
      loadSchoolPokemonPool();
    }
  }, [studentId, schoolId]);
  
  const loadStudentData = () => {
    // Load Pokemon collection and coins
    const collection = getStudentPokemonCollection(studentId);
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
    // Initialize the school pool if it doesn't exist
    const pool = initializeSchoolPokemonPool(schoolId);
    if (pool) {
      setSchoolPokemons(pool.availablePokemons);
    } else {
      setSchoolPokemons([]);
    }
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
    // Toast notification
    if (pokemon && pokemon.id) {
      toast({
        title: t("congratulations"),
        description: t("you-won-pokemon").replace("{name}", pokemon.name || "Pokemon"),
      });
    }
    
    // Refresh data
    loadStudentData();
    loadSchoolPokemonPool();
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
        <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold mb-2">Welcome, {studentName}!</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                <span className="font-bold">{coins} Coins</span>
              </div>
              
              <div className="flex gap-2">
                {activeBattles.length > 0 && (
                  <Button 
                    className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                    onClick={() => navigate("/student/battles")}
                  >
                    <Sword className="h-4 w-4" />
                    {t("active-battles")} ({activeBattles.length})
                  </Button>
                )}
                
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                  onClick={() => navigate("/student/messages")}
                >
                  <MessageSquare className="h-4 w-4" />
                  {t("messages")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collection" className="text-lg">My Collection</TabsTrigger>
            <TabsTrigger value="wheel" className="text-lg">Pokemon Wheel</TabsTrigger>
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
            <div className="flex flex-col items-center">
              <Card className="max-w-md w-full mb-6 pokemon-card">
                <CardHeader>
                  <CardTitle>Pokémon Wheel</CardTitle>
                  <CardDescription>Spend 1 coin to spin the wheel and win a Pokémon!</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <PokemonWheel 
                    studentId={studentId} 
                    classId={schoolId}
                    pokemonPool={schoolPokemons}
                    coins={coins}
                    onPokemonWon={handlePokemonWon}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
