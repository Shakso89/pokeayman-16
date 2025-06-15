
import { useState, useEffect } from 'react';
import { getStudentCoinData, type StudentCoinData } from '@/services/studentCoinService';

export const useStudentCoinData = (studentId: string) => {
  const [coinData, setCoinData] = useState<StudentCoinData>({
    coins: 0,
    spent_coins: 0,
    pokemonCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      const data = await getStudentCoinData(studentId);
      setCoinData(data);
    } catch (error) {
      console.error('Error loading student coin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [studentId]);

  return {
    ...coinData,
    isLoading,
    refreshData
  };
};
