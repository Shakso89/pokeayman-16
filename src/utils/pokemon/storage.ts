
// Remove unused imports since we're using the database now
export const getPokemonPools = () => {
  console.warn("getPokemonPools is deprecated - use database functions instead");
  return [];
};

export const savePokemonPools = () => {
  console.warn("savePokemonPools is deprecated - use database functions instead");
};

export const getStudentPokemons = () => {
  console.warn("getStudentPokemons is deprecated - use database functions instead");
  return [];
};

export const saveStudentPokemons = () => {
  console.warn("saveStudentPokemons is deprecated - use database functions instead");
};
