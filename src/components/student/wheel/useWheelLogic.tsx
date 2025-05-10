
import { useState, useEffect, useRef } from "react";
import { Pokemon } from "@/types/pokemon";
import { getSchoolPokemonPool, assignPokemonToStudent, useStudentCoin, removeCoinsFromStudent } from "@/utils/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getRandomPokemonSubset, checkRefreshAllowed, MAX_WHEEL_POKEMON } from "./pokemonWheelUtils";

export const useWheelLogic = (studentId: string, classId: string, coins: number, onPokemonWon: (pokemon: Pokemon) => void) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  
  // Calculate wheel segment degree
  const wheelSegmentDegree = visiblePokemon.length > 0 ? 360 / visiblePokemon.length : 30;
  
  // Load Pokemon wheel data
  useEffect(() => {
    console.log("Loading Pokemon wheel data for student:", studentId, "class:", classId);
    
    const refreshPoolData = () => {
      if (classId) {
        const schoolPool = getSchoolPokemonPool(classId);
        console.log("School pool:", schoolPool);
        
        if (schoolPool && schoolPool.availablePokemons.length > 0) {
          // Get stored wheel Pokemon for this student or create new random selection
          const storedWheelPokemon = localStorage.getItem(`wheelPokemon_${studentId}`);
          
          if (storedWheelPokemon) {
            try {
              const parsedPokemon = JSON.parse(storedWheelPokemon);
              // Validate that these Pokemon still exist in the pool
              const validPokemon = parsedPokemon.filter((p: Pokemon) => 
                schoolPool.availablePokemons.some(sp => sp.id === p.id)
              );
              
              if (validPokemon.length > 0) {
                console.log("Using stored Pokemon for wheel:", validPokemon.length);
                setVisiblePokemon(validPokemon);
              } else {
                // If none are valid anymore, get new random selection
                const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
                console.log("No valid stored Pokemon. Created new selection:", randomSubset.length);
                setVisiblePokemon(randomSubset);
                localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
              }
            } catch (error) {
              console.error("Error parsing stored wheel Pokemon:", error);
              const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
              console.log("Error with stored Pokemon. Created new selection:", randomSubset.length);
              setVisiblePokemon(randomSubset);
              localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
            }
          } else {
            // No stored wheel Pokemon, create new random selection
            const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
            console.log("No stored Pokemon. Created new selection:", randomSubset.length);
            setVisiblePokemon(randomSubset);
            localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
          }
        } else {
          console.log("No Pokemon in school pool or pool is empty");
          setVisiblePokemon([]);
        }
      } else {
        console.log("No class ID provided");
      }
    };

    // Initial load
    refreshPoolData();
    const { canRefresh: allowed, lastRefreshed: lastTime } = checkRefreshAllowed(studentId);
    setCanRefresh(allowed);
    setLastRefreshed(lastTime);
  }, [studentId, classId]);
  
  // Reset rotation after spinning for animation purposes
  useEffect(() => {
    if (!isSpinning) {
      setTimeout(() => {
        setRotationDegree(0);
      }, 500);
    }
  }, [isSpinning]);
  
  // Handle spinning the wheel
  const handleSpin = () => {
    if (coins <= 0) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    if (isSpinning || visiblePokemon.length === 0) {
      return;
    }
    
    // Use a coin
    const success = useStudentCoin(studentId);
    if (!success) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    setIsSpinning(true);
    setShowWinAnimation(false);
    setWonPokemon(null);
    
    // Randomly determine winner
    const winnerIndex = Math.floor(Math.random() * visiblePokemon.length);
    
    // Calculate rotation to land on winner
    const baseRotation = 3600; // Spin multiple times for effect
    const winnerPositionDegree = 270; // Top position
    const winnerRotation = winnerPositionDegree - (winnerIndex * wheelSegmentDegree);
    
    const targetRotation = baseRotation + winnerRotation;
    
    setRotationDegree(targetRotation);
    setSelectedPokemonIndex(winnerIndex);
    
    // Wait for spin animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Assign the pokemon to the student
      if (winnerIndex >= 0 && winnerIndex < visiblePokemon.length) {
        const wonPokemon = visiblePokemon[winnerIndex];
        
        // Assign Pokemon to student (which will remove it from the school pool)
        const success = assignPokemonToStudent(classId, studentId, wonPokemon.id);
        
        if (success) {
          setWonPokemon(wonPokemon);
          setShowWinAnimation(true);
          
          // Wait a moment before showing the toast to let the animation start
          setTimeout(() => {
            toast({
              title: t("congratulations"),
              description: t("you-won-pokemon").replace("{name}", wonPokemon.name)
            });
          }, 500);
          
          // Remove the won pokemon from the visible pokemon list
          const updatedVisiblePokemon = visiblePokemon.filter(p => p.id !== wonPokemon.id);
          
          // If the wheel is now empty, get new pokemon
          if (updatedVisiblePokemon.length === 0) {
            // Get fresh pool data
            const schoolPool = getSchoolPokemonPool(classId);
            if (schoolPool && schoolPool.availablePokemons.length > 0) {
              const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
              setVisiblePokemon(randomSubset);
              localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
            } else {
              setVisiblePokemon([]);
            }
          } else {
            setVisiblePokemon(updatedVisiblePokemon);
            localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(updatedVisiblePokemon));
          }
          
          onPokemonWon(wonPokemon);
        } else {
          toast({
            title: t("error"),
            description: "Failed to claim Pokémon."
          });
        }
      }
    }, 3000);
  };
  
  // Handle refreshing the wheel
  const handleRefreshWheel = () => {
    // Check if refreshing is allowed
    if (!canRefresh) {
      toast({
        title: t("error"),
        description: t("daily-refresh-limit")
      });
      return;
    }
    
    // Use a coin for refreshing
    if (coins < 1) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    // Remove a coin
    const coinRemoved = removeCoinsFromStudent(studentId, 1);
    if (!coinRemoved) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    // Get fresh pokemon from the pool
    const schoolPool = getSchoolPokemonPool(classId);
    if (schoolPool && schoolPool.availablePokemons.length > 0) {
      const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
      setVisiblePokemon(randomSubset);
      
      // Store the new selection and refresh timestamp
      localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
      const now = new Date().toISOString();
      localStorage.setItem(`wheelRefresh_${studentId}`, now);
      
      setLastRefreshed(now);
      setCanRefresh(false);
      
      // Update UI
      toast({
        title: t("wheel-refreshed"),
        description: t("new-pokemon-available")
      });
      
      // Trigger the parent to update coins display
      onPokemonWon({} as Pokemon);
    } else {
      toast({
        title: t("error"),
        description: t("no-pokemon-in-pool")
      });
    }
  };
  
  const closeWinModal = () => {
    setShowWinAnimation(false);
  };

  return {
    isSpinning,
    rotationDegree,
    selectedPokemonIndex,
    visiblePokemon,
    showWinAnimation,
    wonPokemon,
    canRefresh,
    wheelSegmentDegree,
    handleSpin,
    handleRefreshWheel,
    closeWinModal
  };
};
