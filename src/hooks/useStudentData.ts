import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { 
  getOrCreateStudentProfile, 
  getStudentPokemonCollection, 
  getStudentProfileById,
  StudentProfile 
} from '@/services/studentDatabase';

export const useStudentData = (studentId: string, userId?: string, username?: string) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudentData = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      let studentProfile: StudentProfile | null = null;

      // If we have userId and username, try to get or create profile
      if (userId && username) {
        studentProfile = await getOrCreateStudentProfile(userId, username);
      } else {
        // Otherwise get existing profile by student ID
        studentProfile = await getStudentProfileById(studentId);
      }

      if (studentProfile) {
        setProfile(studentProfile);
        setCoins(studentProfile.coins);
        setSpentCoins(studentProfile.spent_coins);

        // Load Pokemon collection
        const pokemonCollection = await getStudentPokemonCollection(studentProfile.id);
        setPokemons(pokemonCollection);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadStudentData();
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId, userId, username]);

  return {
    profile,
    pokemons,
    coins,
    spentCoins,
    isLoading,
    refreshData
  };
};
