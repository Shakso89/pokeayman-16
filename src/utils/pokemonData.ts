
import { Pokemon, PokemonPool, StudentPokemon } from "@/types/pokemon";

// Expanded Pokemon data
export const samplePokemons: Pokemon[] = [
  // Original Pokémon
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
  },
  // Additional Pokémon
  {
    id: "9",
    name: "Charizard",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    type: "Fire/Flying",
    rarity: "rare"
  },
  {
    id: "10",
    name: "Blastoise",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    type: "Water",
    rarity: "rare"
  },
  {
    id: "11",
    name: "Venusaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    type: "Grass/Poison",
    rarity: "rare"
  },
  {
    id: "12",
    name: "Jigglypuff",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    type: "Normal/Fairy",
    rarity: "common"
  },
  {
    id: "13",
    name: "Snorlax",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "14",
    name: "Gyarados",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
    type: "Water/Flying",
    rarity: "rare"
  },
  {
    id: "15",
    name: "Mew",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    type: "Psychic",
    rarity: "legendary"
  },
  {
    id: "16",
    name: "Arcanine",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "17",
    name: "Alakazam",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
    type: "Psychic",
    rarity: "rare"
  },
  {
    id: "18",
    name: "Machamp",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png",
    type: "Fighting",
    rarity: "rare"
  },
  {
    id: "19",
    name: "Lapras",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png",
    type: "Water/Ice",
    rarity: "rare"
  },
  {
    id: "20",
    name: "Vaporeon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png",
    type: "Water",
    rarity: "uncommon"
  },
  {
    id: "21",
    name: "Jolteon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "22",
    name: "Flareon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png",
    type: "Fire",
    rarity: "uncommon"
  },
  {
    id: "23",
    name: "Aerodactyl",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png",
    type: "Rock/Flying",
    rarity: "rare"
  },
  {
    id: "24",
    name: "Articuno",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png",
    type: "Ice/Flying",
    rarity: "legendary"
  },
  {
    id: "25",
    name: "Zapdos",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png",
    type: "Electric/Flying",
    rarity: "legendary"
  },
  {
    id: "26",
    name: "Moltres",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png",
    type: "Fire/Flying",
    rarity: "legendary"
  },
  {
    id: "27",
    name: "Raichu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "28",
    name: "Nidoking",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png",
    type: "Poison/Ground",
    rarity: "rare"
  },
  {
    id: "29",
    name: "Nidoqueen",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png",
    type: "Poison/Ground",
    rarity: "rare"
  },
  {
    id: "30",
    name: "Clefairy",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png",
    type: "Fairy",
    rarity: "uncommon"
  },
  {
    id: "31",
    name: "Vulpix",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "32",
    name: "Ninetales",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "33",
    name: "Growlithe",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "34",
    name: "Poliwag",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "35",
    name: "Kadabra",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png",
    type: "Psychic",
    rarity: "uncommon"
  },
  {
    id: "36",
    name: "Tentacool",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/72.png",
    type: "Water/Poison",
    rarity: "common"
  },
  {
    id: "37",
    name: "Geodude",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png",
    type: "Rock/Ground",
    rarity: "common"
  },
  {
    id: "38",
    name: "Rapidash",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png",
    type: "Fire",
    rarity: "uncommon"
  },
  {
    id: "39",
    name: "Slowpoke",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png",
    type: "Water/Psychic",
    rarity: "common"
  },
  {
    id: "40",
    name: "Magnemite",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png",
    type: "Electric/Steel",
    rarity: "common"
  },
  {
    id: "41",
    name: "Farfetch'd",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png",
    type: "Normal/Flying",
    rarity: "uncommon"
  },
  {
    id: "42",
    name: "Doduo",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png",
    type: "Normal/Flying",
    rarity: "common"
  },
  {
    id: "43",
    name: "Seel",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "44",
    name: "Grimer",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png",
    type: "Poison",
    rarity: "common"
  },
  {
    id: "45",
    name: "Shellder",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/90.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "46",
    name: "Gastly",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png",
    type: "Ghost/Poison",
    rarity: "uncommon"
  },
  {
    id: "47",
    name: "Onix",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png",
    type: "Rock/Ground",
    rarity: "uncommon"
  },
  {
    id: "48",
    name: "Drowzee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png",
    type: "Psychic",
    rarity: "common"
  },
  {
    id: "49",
    name: "Krabby",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "50",
    name: "Voltorb",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png",
    type: "Electric",
    rarity: "common"
  },
  {
    id: "51",
    name: "Exeggcute",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png",
    type: "Grass/Psychic",
    rarity: "common"
  },
  {
    id: "52",
    name: "Cubone",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png",
    type: "Ground",
    rarity: "common"
  },
  {
    id: "53",
    name: "Hitmonlee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png",
    type: "Fighting",
    rarity: "uncommon"
  },
  {
    id: "54",
    name: "Hitmonchan",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/107.png",
    type: "Fighting",
    rarity: "uncommon"
  },
  {
    id: "55",
    name: "Lickitung",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/108.png",
    type: "Normal",
    rarity: "uncommon"
  },
  {
    id: "56",
    name: "Koffing",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png",
    type: "Poison",
    rarity: "common"
  },
  {
    id: "57",
    name: "Rhyhorn",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/111.png",
    type: "Ground/Rock",
    rarity: "common"
  },
  {
    id: "58",
    name: "Chansey",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "59",
    name: "Tangela",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png",
    type: "Grass",
    rarity: "uncommon"
  },
  {
    id: "60",
    name: "Kangaskhan",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "61",
    name: "Mr. Mime",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png",
    type: "Psychic/Fairy",
    rarity: "uncommon"
  },
  {
    id: "62",
    name: "Scyther",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png",
    type: "Bug/Flying",
    rarity: "rare"
  },
  {
    id: "63",
    name: "Jynx",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png",
    type: "Ice/Psychic",
    rarity: "uncommon"
  },
  {
    id: "64",
    name: "Electabuzz",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png",
    type: "Electric",
    rarity: "rare"
  },
  {
    id: "65",
    name: "Magmar",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "66",
    name: "Pinsir",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
    type: "Bug",
    rarity: "rare"
  },
  {
    id: "67",
    name: "Tauros",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "68",
    name: "Magikarp",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "69",
    name: "Ditto",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "70",
    name: "Omanyte",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/138.png",
    type: "Rock/Water",
    rarity: "uncommon"
  },
  {
    id: "71",
    name: "Kabuto",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/140.png",
    type: "Rock/Water",
    rarity: "uncommon"
  },
  {
    id: "72",
    name: "Dratini",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png",
    type: "Dragon",
    rarity: "rare"
  },
  {
    id: "73",
    name: "Lugia",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png",
    type: "Psychic/Flying",
    rarity: "legendary"
  },
  {
    id: "74",
    name: "Ho-Oh",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png",
    type: "Fire/Flying",
    rarity: "legendary"
  },
  {
    id: "75",
    name: "Celebi",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png",
    type: "Psychic/Grass",
    rarity: "legendary"
  },
  {
    id: "76",
    name: "Treecko",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png",
    type: "Grass",
    rarity: "common"
  },
  {
    id: "77",
    name: "Torchic",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "78",
    name: "Mudkip",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "79",
    name: "Rayquaza",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png",
    type: "Dragon/Flying",
    rarity: "legendary"
  },
  {
    id: "80",
    name: "Lucario",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    type: "Fighting/Steel",
    rarity: "rare"
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
