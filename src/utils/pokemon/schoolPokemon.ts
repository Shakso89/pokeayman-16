import { Pokemon, PokemonPool } from "@/types/pokemon";
import { getPokemonPools, savePokemonPools } from "./storage";
import { samplePokemons } from "./sampleData";
import { getRandomType, getRarityForId } from "./types";

// Real Pokémon names for generated Pokémon
const pokemonNames = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise",
  "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata",
  "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran", "Nidorina",
  "Nidoqueen", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff",
  "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio",
  "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath",
  "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel",
  "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo", "Dodrio",
  "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby",
  "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing",
  "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie",
  "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee",
  "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno",
  "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew", "Chikorita", "Bayleef", "Meganium", "Cyndaquil",
  "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian",
  "Spinarak", "Ariados", "Crobat", "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu",
  "Mareep", "Flaaffy", "Ampharos", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip", "Skiploom", "Jumpluff",
  "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking", "Misdreavus", "Unown",
  "Wobbuffet", "Girafarig", "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish", "Scizor",
  "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid",
  "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler",
  "Smeargle", "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey", "Raikou", "Entei", "Suicune", "Larvitar",
  "Pupitar", "Tyranitar", "Lugia", "Ho-Oh", "Celebi",
  // Adding more Pokémon names for the expanded pool
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", 
  "Poochyena", "Mightyena", "Zigzagoon", "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", 
  "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper", 
  "Ralts", "Kirlia", "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", 
  "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama", 
  "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon", "Aggron", "Meditite", 
  "Medicham", "Electrike", "Manectric", "Plusle", "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", 
  "Swalot", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt", "Torkoal", "Spoink", "Grumpig", 
  "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose", "Seviper", 
  "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", 
  "Anorith", "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Duskull", "Dusclops", 
  "Tropius", "Chimecho", "Absol", "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein", "Clamperl", 
  "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", 
  "Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys",
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", 
  "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", 
  "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", 
  "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Ambipom", "Drifloon", 
  "Drifblim", "Buneary", "Lopunny", "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky", "Skuntank", 
  "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny", "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", 
  "Munchlax", "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", 
  "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", 
  "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", 
  "Probopass", "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", 
  "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus"
];

// Specific mapping for Pokémon shown in the image
const specificPokemonMapping = {
  305: "Lairon", // Dragon-type in the image
  307: "Meditite", // Steel-type in the image
  309: "Electrike", // Normal-type in the image
  311: "Plusle", // Rock-type in the image
  313: "Volbeat", // Bug-type in the image
  325: "Spoink", // Fairy-type in the image
  327: "Trapinch", // Electric-type in the image
  329: "Vibrava", // Flying-type in the image
  331: "Cacnea", // Psychic/Electric-type in the image
  333: "Swablu", // Fire-type in the image
  335: "Zangoose", // Fighting-type in the image
  337: "Lunatone" // Ghost-type in the image
};

// Initialize a Pokemon pool for a school
export const initializeSchoolPokemonPool = (schoolId: string) => {
  // Check if the pool already exists by directly searching through pools
  // instead of calling getSchoolPokemonPool to avoid recursion
  const existingPools = getPokemonPools();
  const existingPool = existingPools.find(p => p.schoolId === schoolId);
  
  // If the pool exists but has fewer than 500 Pokémon, update it to have 500
  if (existingPool) {
    if (existingPool.availablePokemons.length < 500) {
      console.log(`Updating school ${schoolId} pool from ${existingPool.availablePokemons.length} to 500 Pokémon`);
      return updateSchoolPokemonPoolTo500(schoolId, existingPool);
    }
    return existingPool;
  }

  // Create a pool of exactly 500 unique Pokemons
  const pokemons: Pokemon[] = [];

  // First add the sample pokemons (up to 60)
  const samplePokemonsCopy = [...samplePokemons];
  for (let i = 0; i < Math.min(60, samplePokemonsCopy.length); i++) {
    const pokemon = {...samplePokemonsCopy[i]};
    // Ensure unique ID for each Pokemon
    pokemon.id = `pokemon-${schoolId}-${i+1}`;
    pokemons.push(pokemon);
  }

  // Then generate the remaining pokemons to reach exactly 500
  const remainingCount = 500 - pokemons.length;
  for (let i = 1; i <= remainingCount; i++) {
    const index = pokemons.length + i;
    const pokedexNumber = (index % 898) + 1;
    const rarity = getRarityForId(index);
    
    // Use specific name for Pokémon that match the ones in the image
    let pokemonName;
    if (specificPokemonMapping[pokedexNumber]) {
      pokemonName = specificPokemonMapping[pokedexNumber];
    } else {
      // Use actual Pokémon names from our list based on Pokédex number when possible
      // For simplicity, we'll just use the index to pick a name
      const nameIndex = pokedexNumber % pokemonNames.length;
      pokemonName = pokemonNames[nameIndex];
    }
    
    pokemons.push({
      id: `pokemon-${schoolId}-${index}`,
      name: pokemonName,
      type: getRandomType(),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumber}.png`,
      rarity
    });
  }

  // Create new pool or update existing one
  const newPool = {
    schoolId,
    availablePokemons: pokemons
  };
  
  // Check if school pool already exists in the pools array
  const existingPoolIndex = existingPools.findIndex(p => p.schoolId === schoolId);
  
  if (existingPoolIndex >= 0) {
    // Update existing pool
    existingPools[existingPoolIndex] = newPool;
  } else {
    // Add new pool
    existingPools.push(newPool);
  }
  
  savePokemonPools(existingPools);
  
  return newPool;
};

// Function to update existing pools to 500 Pokémon
export const updateSchoolPokemonPoolTo500 = (schoolId: string, existingPool: PokemonPool) => {
  const currentCount = existingPool.availablePokemons.length;
  const additionalNeeded = 500 - currentCount;
  
  if (additionalNeeded <= 0) {
    return existingPool; // Pool already has 500 or more
  }
  
  // Keep existing Pokémon
  const updatedPokemons = [...existingPool.availablePokemons];
  
  // Add additional Pokémon
  for (let i = 1; i <= additionalNeeded; i++) {
    const index = currentCount + i;
    const pokedexNumber = (index % 898) + 1;
    const rarity = getRarityForId(index);
    
    // Use Pokémon names from our list
    const nameIndex = pokedexNumber % pokemonNames.length;
    const pokemonName = pokemonNames[nameIndex];
    
    updatedPokemons.push({
      id: `pokemon-${schoolId}-${index}`,
      name: pokemonName,
      type: getRandomType(),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumber}.png`,
      rarity
    });
  }
  
  // Create updated pool
  const updatedPool = {
    schoolId,
    availablePokemons: updatedPokemons
  };
  
  // Save to localStorage
  const existingPools = getPokemonPools();
  const existingPoolIndex = existingPools.findIndex(p => p.schoolId === schoolId);
  
  if (existingPoolIndex >= 0) {
    existingPools[existingPoolIndex] = updatedPool;
  } else {
    existingPools.push(updatedPool);
  }
  
  savePokemonPools(existingPools);
  
  return updatedPool;
};

// Update all existing school pools to have 500 Pokémon
export const updateAllSchoolPoolsTo500 = () => {
  const existingPools = getPokemonPools();
  let updatedAny = false;
  
  for (const pool of existingPools) {
    if (pool.availablePokemons.length < 500) {
      updateSchoolPokemonPoolTo500(pool.schoolId, pool);
      updatedAny = true;
    }
  }
  
  return updatedAny;
};

// Get school Pokemon pool
export const getSchoolPokemonPool = (schoolId: string): PokemonPool | null => {
  if (!schoolId) return null;
  
  const pools = getPokemonPools();
  const pool = pools.find(p => p.schoolId === schoolId);
  
  // If there's no pool but we have a school ID, initialize it
  if (!pool && schoolId) {
    return initializeSchoolPokemonPool(schoolId);
  }
  
  return pool || null;
};

// Get a random Pokemon from the school pool
export const getRandomPokemonFromPool = (schoolId: string): Pokemon | null => {
  const pool = getSchoolPokemonPool(schoolId);
  if (!pool || pool.availablePokemons.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pool.availablePokemons.length);
  return pool.availablePokemons[randomIndex];
};

// Get daily wheel pokemons for a specific school
export const getDailyWheelPokemons = (schoolId: string): Pokemon[] => {
  if (!schoolId) return [];
  
  const pool = getSchoolPokemonPool(schoolId);
  if (!pool || pool.availablePokemons.length === 0) return [];
  
  // Use current date as seed for consistent daily selection
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  
  // Generate a pseudo-random seed based on schoolId and date
  let seed = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    seed += dateSeed.charCodeAt(i);
  }
  for (let i = 0; i < schoolId.length; i++) {
    seed += schoolId.charCodeAt(i);
  }
  
  // Select up to 12 different pokemons using the seed
  const availablePokemons = [...pool.availablePokemons];
  const wheelPokemons: Pokemon[] = [];
  const MAX_WHEEL_POKEMONS = 12;
  
  // Select minimum between available pokemons and 12
  const count = Math.min(MAX_WHEEL_POKEMONS, availablePokemons.length);
  
  for (let i = 0; i < count; i++) {
    // Use a deterministic algorithm to select pokemons
    const pseudoRandomIndex = (seed + i * 7919) % availablePokemons.length;
    wheelPokemons.push(availablePokemons.splice(pseudoRandomIndex, 1)[0]);
    // Update seed for next selection to ensure different indices
    seed = (seed * 9973 + 7919) % 99991;
  }
  
  return wheelPokemons;
};

// Function to update all existing school pools
export const forceUpdateAllSchoolPools = () => {
  updateAllSchoolPoolsTo500();
};

// For backward compatibility
export const getClassPokemonPool = getSchoolPokemonPool;
export const initializeClassPokemonPool = initializeSchoolPokemonPool;
