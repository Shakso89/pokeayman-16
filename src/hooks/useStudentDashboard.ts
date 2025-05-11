
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Pokemon } from "@/types/pokemon";
import { getStudentPokemonCollection, getSchoolPokemonPool, 
  initializeSchoolPokemonPool, awardCoinsToStudent } from "@/utils/pokemon";

export function useStudentDashboard(studentId: string, classId: string, schoolId: string) {
  const { toast } = useToast();
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [schoolPokemons, setSchoolPokemons] = useState<Pokemon[]>([]);
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showSchoolPool, setShowSchoolPool] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("StudentDashboard loaded with:", {
      studentId,
      classId,
      schoolId
    });
    
    if (studentId) {
      loadStudentData();
      loadActiveBattles();
    }
    
    if (schoolId) {
      loadSchoolPokemonPool();
    } else {
      console.warn("No schoolId found, creating default school ID");
      // If no school ID is set, use a default one to ensure functionality
      localStorage.setItem("studentSchoolId", "default-school-1");
    }
  }, [studentId, schoolId]);

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
    const currentSchoolId = schoolId || localStorage.getItem("studentSchoolId") || "default-school-1";
    console.log("Loading school pokemon pool for:", currentSchoolId);
    // Initialize the school pool if it doesn't exist
    const pool = initializeSchoolPokemonPool(currentSchoolId);
    console.log("School pokemon pool:", pool);
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
      const isRelevant = battle.schoolId === schoolId && (!battle.classId || battle.classId === classId);
      // Active and not expired
      const isActive = battle.status === "active";
      const isNotExpired = new Date(battle.timeLimit).getTime() > Date.now();
      return isRelevant && isActive && isNotExpired;
    });
    
    setActiveBattles(relevantBattles);
  };

  // Handle Pokemon won event
  const handlePokemonWon = (pokemon: Pokemon) => {
    console.log("Pokemon won:", pokemon);
    // Refresh data after pokemon is won
    toast({
      title: "Congratulations",
      description: `You got a new Pokemon: ${pokemon.name}!`
    });
    loadStudentData();
    loadSchoolPokemonPool();
  };

  // Handle coins won event
  const handleCoinsWon = (amount: number) => {
    console.log("Coins won:", amount);
    // Add coins to student
    awardCoinsToStudent(studentId, amount);
    // Refresh data
    toast({
      title: "Congratulations",
      description: `You got ${amount} coins!`
    });
    loadStudentData();
  };

  // Handle refresh pool
  const handleRefreshPool = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadSchoolPokemonPool();
      setIsLoading(false);
    }, 1000);
  };

  return {
    studentPokemons,
    coins,
    schoolPokemons,
    activeBattles,
    avatar,
    showSchoolPool,
    setShowSchoolPool,
    isLoading,
    handlePokemonWon,
    handleCoinsWon,
    handleRefreshPool
  };
}
