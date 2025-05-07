
import { Pokemon, PokemonPool, StudentPokemon } from "@/types/pokemon";

// Sample Pokemon data
export const samplePokemons: Pokemon[] = [
  {
    id: "1",
    name: "Pikachu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "2",
    name: "Bulbasaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    type: "Grass/Poison",
    rarity: "common"
  },
  {
    id: "3",
    name: "Charmander",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "4",
    name: "Squirtle",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "5",
    name: "Mewtwo",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    type: "Psychic",
    rarity: "legendary"
  },
  {
    id: "6",
    name: "Gengar",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    type: "Ghost/Poison",
    rarity: "rare"
  },
  {
    id: "7",
    name: "Dragonite",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    type: "Dragon/Flying",
    rarity: "rare"
  },
  {
    id: "8",
    name: "Eevee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    type: "Normal",
    rarity: "uncommon"
  }
];

// Get Pokemon pools from localStorage or create default ones
export const getPokemonPools = (): PokemonPool[] => {
  const savedPools = localStorage.getItem("pokemonPools");
  if (savedPools) return JSON.parse(savedPools);
  return [];
};

// Save Pokemon pools to localStorage
export const savePokemonPools = (pools: PokemonPool[]) => {
  localStorage.setItem("pokemonPools", JSON.stringify(pools));
};

// Get student Pokemons from localStorage
export const getStudentPokemons = (): StudentPokemon[] => {
  const savedStudentPokemons = localStorage.getItem("studentPokemons");
  if (savedStudentPokemons) return JSON.parse(savedStudentPokemons);
  return [];
};

// Save student Pokemons to localStorage
export const saveStudentPokemons = (studentPokemons: StudentPokemon[]) => {
  localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
};

// Initialize Pokemon pool for a class
export const initializeClassPokemonPool = (classId: string): PokemonPool => {
  // Create a deep copy of sample Pokemons
  const pokemons = JSON.parse(JSON.stringify(samplePokemons));
  
  const pool: PokemonPool = {
    classId,
    availablePokemons: pokemons
  };
  
  const existingPools = getPokemonPools();
  const updatedPools = [...existingPools.filter(p => p.classId !== classId), pool];
  savePokemonPools(updatedPools);
  
  return pool;
};

// Award coins to a student
export const awardCoinsToStudent = (studentId: string, amount: number): void => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].coins += amount;
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [],
      coins: amount
    });
  }
  
  saveStudentPokemons(studentPokemons);
};

// Assign Pokemon to a student
export const assignPokemonToStudent = (classId: string, studentId: string, pokemonId: string): boolean => {
  const pools = getPokemonPools();
  const poolIndex = pools.findIndex(p => p.classId === classId);
  
  if (poolIndex < 0) return false;
  
  const pokemonIndex = pools[poolIndex].availablePokemons.findIndex(p => p.id === pokemonId);
  if (pokemonIndex < 0) return false;
  
  // Remove Pokemon from pool
  const pokemon = pools[poolIndex].availablePokemons.splice(pokemonIndex, 1)[0];
  savePokemonPools(pools);
  
  // Add Pokemon to student
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].pokemons.push(pokemon);
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [pokemon],
      coins: 0
    });
  }
  
  saveStudentPokemons(studentPokemons);
  return true;
};

// Get student Pokemon collection
export const getStudentPokemonCollection = (studentId: string): StudentPokemon | null => {
  const studentPokemons = getStudentPokemons();
  return studentPokemons.find(sp => sp.studentId === studentId) || null;
};

// Get class Pokemon pool
export const getClassPokemonPool = (classId: string): PokemonPool | null => {
  const pools = getPokemonPools();
  return pools.find(p => p.classId === classId) || null;
};

// Use a coin to spin the wheel
export const useStudentCoin = (studentId: string): boolean => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex < 0 || studentPokemons[studentIndex].coins <= 0) {
    return false;
  }
  
  studentPokemons[studentIndex].coins -= 1;
  saveStudentPokemons(studentPokemons);
  return true;
};

// Get a random Pokemon from the class pool
export const getRandomPokemonFromPool = (classId: string): Pokemon | null => {
  const pool = getClassPokemonPool(classId);
  if (!pool || pool.availablePokemons.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pool.availablePokemons.length);
  return pool.availablePokemons[randomIndex];
};
