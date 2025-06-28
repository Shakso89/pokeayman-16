
import { useState, useEffect } from 'react';
import { getStudentCoins } from '@/services/studentCoinService';
import { getStudentPokemonCollection } from '@/services/unifiedPokemonService';
import { supabase } from '@/integrations/supabase/client';

export const useStudentCoinData = (studentId: string) => {
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [pokemonCount, setPokemonCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!studentId || studentId === 'undefined') {
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

        // Get Pokemon count using unified service
        const pokemonCollection = await getStudentPokemonCollection(studentId);
        setPokemonCount(pokemonCollection.length);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setCoins(0);
        setSpentCoins(0);
        setPokemonCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();

    // Set up real-time subscription for coin updates
    const coinSubscription = supabase
      .channel('student-coin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_profiles',
          filter: `user_id=eq.${studentId}`
        },
        () => {
          console.log('🔄 Real-time coin update detected');
          fetchCoinData();
        }
      )
      .subscribe();

    // Also listen to students table for legacy support
    const legacyCoinSubscription = supabase
      .channel('legacy-coin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `user_id=eq.${studentId}`
        },
        () => {
          console.log('🔄 Real-time legacy coin update detected');
          fetchCoinData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(coinSubscription);
      supabase.removeChannel(legacyCoinSubscription);
    };
  }, [studentId]);

  const refreshCoinData = async () => {
    if (!studentId || studentId === 'undefined') return;
    
    try {
      const coinData = await getStudentCoins(studentId);
      if (coinData) {
        setCoins(coinData.coins);
        setSpentCoins(coinData.spentCoins);
      }

      // Refresh Pokemon count using unified service
      const pokemonCollection = await getStudentPokemonCollection(studentId);
      setPokemonCount(pokemonCollection.length);
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    }
  };

  // Alias for backwards compatibility
  const refreshData = refreshCoinData;

  return {
    coins,
    spentCoins,
    pokemonCount,
    isLoading,
    refreshCoinData,
    refreshData
  };
};
