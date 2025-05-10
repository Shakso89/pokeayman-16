
import { Pokemon } from "@/types/pokemon";

export const MAX_WHEEL_POKEMON = 12;

export const getRandomPokemonSubset = (pool: Pokemon[], count: number) => {
  if (pool.length <= count) {
    return [...pool];
  }
  
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const checkRefreshAllowed = (studentId: string) => {
  const lastRefreshDate = localStorage.getItem(`wheelRefresh_${studentId}`);
  
  if (!lastRefreshDate) {
    return { canRefresh: true, lastRefreshed: null };
  }
  
  const lastDate = new Date(lastRefreshDate);
  const currentDate = new Date();
  
  // Check if it's a new day
  const isSameDay = lastDate.getDate() === currentDate.getDate() && 
                    lastDate.getMonth() === currentDate.getMonth() && 
                    lastDate.getFullYear() === currentDate.getFullYear();
  
  return { 
    canRefresh: !isSameDay,
    lastRefreshed: lastRefreshDate
  };
};

export const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return {
        background: 'bg-yellow-500',
        border: 'border-yellow-600',
        glow: 'shadow-yellow-300',
        text: 'text-yellow-700',
        gradient: 'from-yellow-300 to-yellow-600'
      };
    case 'rare':
      return {
        background: 'bg-purple-500',
        border: 'border-purple-600',
        glow: 'shadow-purple-300',
        text: 'text-purple-700',
        gradient: 'from-purple-300 to-purple-600'
      };
    case 'uncommon':
      return {
        background: 'bg-blue-500',
        border: 'border-blue-600',
        glow: 'shadow-blue-300',
        text: 'text-blue-700',
        gradient: 'from-blue-300 to-blue-600'
      };
    default:
      return {
        background: 'bg-green-500',
        border: 'border-green-600',
        glow: 'shadow-green-300',
        text: 'text-green-700',
        gradient: 'from-green-300 to-green-600'
      };
  }
};
