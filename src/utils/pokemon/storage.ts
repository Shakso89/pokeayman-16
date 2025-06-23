
// All storage functions are now deprecated since we use the unified database system
export const getPokemonPools = () => {
  console.warn("getPokemonPools is deprecated - use unifiedPokemonService instead");
  return [];
};

export const savePokemonPools = () => {
  console.warn("savePokemonPools is deprecated - use unifiedPokemonService instead");
};

export const getStudentPokemons = () => {
  console.warn("getStudentPokemons is deprecated - use unifiedPokemonService instead");
  return [];
};

export const saveStudentPokemons = () => {
  console.warn("saveStudentPokemons is deprecated - use unifiedPokemonService instead");
};

export const getSchoolPokemonPools = () => {
  console.warn("getSchoolPokemonPools is deprecated - use unifiedPokemonService instead");
  return [];
};

export const saveSchoolPokemonPools = () => {
  console.warn("saveSchoolPokemonPools is deprecated - use unifiedPokemonService instead");
};

export const refreshSchoolPokemonPool = () => {
  console.warn("refreshSchoolPokemonPool is deprecated - unified pool never needs refreshing");
  return [];
};
