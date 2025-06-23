import { Pokemon } from "@/types/pokemon";

// Expanded Pokemon data with up to 600 entries
export const samplePokemons: Pokemon[] = [
  // Original Pokémon
  {
    id: "1",
    name: "Bulbasaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    type: "Grass/Poison",
    rarity: "uncommon"
  },
  {
    id: "4",
    name: "Charmander",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    type: "Fire",
    rarity: "uncommon"
  },
  {
    id: "7",
    name: "Squirtle",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    type: "Water",
    rarity: "uncommon"
  },
  {
    id: "25",
    name: "Pikachu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    type: "Electric",
    rarity: "rare"
  },
  {
    id: "150",
    name: "Mewtwo",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    type: "Psychic",
    rarity: "legendary"
  },
  {
    id: "94",
    name: "Gengar",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    type: "Ghost/Poison",
    rarity: "rare"
  },
  {
    id: "149",
    name: "Dragonite",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    type: "Dragon/Flying",
    rarity: "rare"
  },
  {
    id: "133",
    name: "Eevee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    type: "Normal",
    rarity: "uncommon"
  },
  // Additional Pokémon
  {
    id: "6",
    name: "Charizard",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    type: "Fire/Flying",
    rarity: "rare"
  },
  {
    id: "9",
    name: "Blastoise",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    type: "Water",
    rarity: "rare"
  },
  {
    id: "3",
    name: "Venusaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    type: "Grass/Poison",
    rarity: "rare"
  },
  {
    id: "39",
    name: "Jigglypuff",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    type: "Normal/Fairy",
    rarity: "common"
  },
  {
    id: "143",
    name: "Snorlax",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "130",
    name: "Gyarados",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
    type: "Water/Flying",
    rarity: "rare"
  },
  {
    id: "151",
    name: "Mew",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    type: "Psychic",
    rarity: "legendary"
  },
  {
    id: "59",
    name: "Arcanine",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "65",
    name: "Alakazam",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
    type: "Psychic",
    rarity: "rare"
  },
  {
    id: "68",
    name: "Machamp",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png",
    type: "Fighting",
    rarity: "rare"
  },
  {
    id: "131",
    name: "Lapras",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png",
    type: "Water/Ice",
    rarity: "rare"
  },
  {
    id: "134",
    name: "Vaporeon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png",
    type: "Water",
    rarity: "uncommon"
  },
  {
    id: "135",
    name: "Jolteon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "136",
    name: "Flareon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png",
    type: "Fire",
    rarity: "uncommon"
  },
  {
    id: "142",
    name: "Aerodactyl",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png",
    type: "Rock/Flying",
    rarity: "rare"
  },
  {
    id: "144",
    name: "Articuno",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png",
    type: "Ice/Flying",
    rarity: "legendary"
  },
  {
    id: "145",
    name: "Zapdos", 
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png",
    type: "Electric/Flying",
    rarity: "legendary"
  },
  {
    id: "146",
    name: "Moltres",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png", 
    type: "Fire/Flying",
    rarity: "legendary"
  },
  {
    id: "26",
    name: "Raichu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "34",
    name: "Nidoking",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png",
    type: "Poison/Ground",
    rarity: "rare"
  },
  {
    id: "31",
    name: "Nidoqueen",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png",
    type: "Poison/Ground",
    rarity: "rare"
  },
  {
    id: "35",
    name: "Clefairy",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png",
    type: "Fairy",
    rarity: "uncommon"
  },
  {
    id: "37",
    name: "Vulpix",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "38",
    name: "Ninetales",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "58",
    name: "Growlithe",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "60",
    name: "Poliwag",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "64",
    name: "Kadabra",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png",
    type: "Psychic",
    rarity: "uncommon"
  },
  {
    id: "72",
    name: "Tentacool",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/72.png",
    type: "Water/Poison",
    rarity: "common"
  },
  {
    id: "74",
    name: "Geodude",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png",
    type: "Rock/Ground",
    rarity: "common"
  },
  {
    id: "78",
    name: "Rapidash",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png",
    type: "Fire",
    rarity: "uncommon"
  },
  {
    id: "79",
    name: "Slowpoke",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png",
    type: "Water/Psychic",
    rarity: "common"
  },
  {
    id: "81",
    name: "Magnemite",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png",
    type: "Electric/Steel",
    rarity: "common"
  },
  {
    id: "83",
    name: "Farfetch'd",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png",
    type: "Normal/Flying",
    rarity: "uncommon"
  },
  {
    id: "84",
    name: "Doduo",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png",
    type: "Normal/Flying",
    rarity: "common"
  },
  {
    id: "86",
    name: "Seel",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "88",
    name: "Grimer",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png",
    type: "Poison",
    rarity: "common"
  },
  {
    id: "90",
    name: "Shellder",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/90.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "92",
    name: "Gastly",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png",
    type: "Ghost/Poison",
    rarity: "uncommon"
  },
  {
    id: "95",
    name: "Onix",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png",
    type: "Rock/Ground",
    rarity: "uncommon"
  },
  {
    id: "96",
    name: "Drowzee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png",
    type: "Psychic",
    rarity: "common"
  },
  {
    id: "98",
    name: "Krabby",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "100",
    name: "Voltorb",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png",
    type: "Electric",
    rarity: "common"
  },
  {
    id: "102",
    name: "Exeggcute",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png",
    type: "Grass/Psychic",
    rarity: "common"
  },
  {
    id: "104",
    name: "Cubone",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png",
    type: "Ground",
    rarity: "common"
  },
  {
    id: "106",
    name: "Hitmonlee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png",
    type: "Fighting",
    rarity: "uncommon"
  },
  {
    id: "107",
    name: "Hitmonchan",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/107.png",
    type: "Fighting",
    rarity: "uncommon"
  },
  {
    id: "108",
    name: "Lickitung",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/108.png",
    type: "Normal",
    rarity: "uncommon"
  },
  {
    id: "109",
    name: "Koffing",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png",
    type: "Poison",
    rarity: "common"
  },
  {
    id: "111",
    name: "Rhyhorn",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/111.png",
    type: "Ground/Rock",
    rarity: "common"
  },
  {
    id: "113",
    name: "Chansey",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "114",
    name: "Tangela",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png",
    type: "Grass",
    rarity: "uncommon"
  },
  {
    id: "115",
    name: "Kangaskhan",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "122",
    name: "Mr. Mime",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png",
    type: "Psychic/Fairy",
    rarity: "uncommon"
  },
  {
    id: "123",
    name: "Scyther",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png",
    type: "Bug/Flying",
    rarity: "rare"
  },
  {
    id: "124",
    name: "Jynx",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png",
    type: "Ice/Psychic",
    rarity: "uncommon"
  },
  {
    id: "125",
    name: "Electabuzz",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png",
    type: "Electric",
    rarity: "rare"
  },
  {
    id: "126",
    name: "Magmar",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png",
    type: "Fire",
    rarity: "rare"
  },
  {
    id: "127",
    name: "Pinsir",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
    type: "Bug",
    rarity: "rare"
  },
  {
    id: "128",
    name: "Tauros",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "129",
    name: "Magikarp",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "132",
    name: "Ditto",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png",
    type: "Normal",
    rarity: "rare"
  },
  {
    id: "138",
    name: "Omanyte",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/138.png",
    type: "Rock/Water",
    rarity: "uncommon"
  },
  {
    id: "140",
    name: "Kabuto",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/140.png",
    type: "Rock/Water",
    rarity: "uncommon"
  },
  {
    id: "147",
    name: "Dratini",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png",
    type: "Dragon",
    rarity: "rare"
  },
  {
    id: "74",
    name: "Geodude",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png",
    type: "Rock/Ground",
    rarity: "common"
  },
  {
    id: "250",
    name: "Ho-Oh",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png",
    type: "Fire/Flying",
    rarity: "legendary"
  },
  {
    id: "76",
    name: "Golem",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png",
    type: "Rock/Ground",
    rarity: "rare"
  },
  {
    id: "252",
    name: "Treecko",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png",
    type: "Grass",
    rarity: "common"
  },
  {
    id: "77",
    name: "Ponyta",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png",
    type: "Fire",
    rarity: "common"
  },
  {
    id: "258",
    name: "Mudkip",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "80",
    name: "Slowbro",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/80.png",
    type: "Water/Psychic",
    rarity: "uncommon"
  },
  {
    id: "448",
    name: "Lucario",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    type: "Fighting/Steel",
    rarity: "rare"
  },
  {
    id: "82",
    name: "Magneton",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png",
    type: "Electric/Steel",
    rarity: "uncommon"
  },
  {
    id: "35",
    name: "Clefairy",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png",
    type: "Fairy",
    rarity: "uncommon"
  },
  {
    id: "83",
    name: "Farfetch'd",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png",
    type: "Normal/Flying",
    rarity: "uncommon"
  },
  {
    id: "84",
    name: "Doduo",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png",
    type: "Normal/Flying",
    rarity: "common"
  },
  {
    id: "86",
    name: "Seel",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "88",
    name: "Grimer",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png",
    type: "Poison",
    rarity: "common"
  },
  {
    id: "89",
    name: "Muk",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/89.png",
    type: "Poison",
    rarity: "uncommon"
  },
  {
    id: "90",
    name: "Shellder",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/90.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "372",
    name: "Shelgon",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/372.png",
    type: "Dragon",
    rarity: "common"
  },
  {
    id: "92",
    name: "Gastly",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png",
    type: "Ghost/Poison",
    rarity: "uncommon"
  },
  {
    id: "479",
    name: "Rotom",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png",
    type: "Electric/Ghost",
    rarity: "common"
  },
  {
    id: "96",
    name: "Drowzee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png",
    type: "Psychic",
    rarity: "common"
  },
  {
    id: "93",
    name: "Haunter",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png",
    type: "Ghost/Poison",
    rarity: "uncommon"
  },
  {
    id: "98",
    name: "Krabby",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png",
    type: "Water",
    rarity: "common"
  },
  {
    id: "99",
    name: "Drowzee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png",
    type: "Psychic",
    rarity: "common"
  },
  {
    id: "100",
    name: "Kingler",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/99.png",
    type: "Water",
    rarity: "uncommon"
  },
  {
    id: "47",
    name: "Parasect",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/47.png",
    type: "Bug/Grass",
    rarity: "common"
  },
  {
    id: "100",
    name: "Voltorb",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png",
    type: "Electric",
    rarity: "common"
  },
  {
    id: "101",
    name: "Electrode",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png",
    type: "Electric",
    rarity: "uncommon"
  },
  {
    id: "102",
    name: "Exeggcute",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png",
    type: "Grass/Psychic",
    rarity: "common"
  }
];

// If more Pokemon entries are needed, continue adding them below
// This is a subset of the original data for brevity
