
import { useState, useEffect } from 'react';
import { getStudentCoins } from '@/services/studentCoinService';

export const useStudentCoinData = (studentId: string) => {
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!studentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const coinData = await getStudentCoins(studentId);
        
        if (coinData) {
          setCoins(coinData.coins);
          setSpentCoins(coinData.spentCoins);
        } else {
          setCoins(0);
          setSpentCoins(0);
        }
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setCoins(0);
        setSpentCoins(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();
  }, [studentId]);

  const refreshCoinData = async () => {
    if (!studentId) return;
    
    try {
      const coinData = await getStudentCoins(studentId);
      if (coinData) {
        setCoins(coinData.coins);
        setSpentCoins(coinData.spentCoins);
      }
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    }
  };

  return {
    coins,
    spentCoins,
    isLoading,
    refreshCoinData
  };
};
