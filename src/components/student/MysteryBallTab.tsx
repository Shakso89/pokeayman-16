
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import MysteryBallDatabase from "./database/MysteryBallDatabase";
import MysteryBallHistoryDatabase from "./database/MysteryBallHistoryDatabase";
import { getSchoolPokemonPool } from "@/services/studentDatabase";

interface MysteryBallTabProps {
  schoolPokemons: Pokemon[];
  studentId: string;
  schoolId: string;
  coins: number;
  isLoading: boolean;
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  onRefreshPool: () => void;
  onDataRefresh: () => void;
}

const MysteryBallTab: React.FC<MysteryBallTabProps> = ({
  schoolPokemons,
  studentId,
  schoolId,
  coins,
  isLoading,
  onPokemonWon,
  onCoinsWon,
  onRefreshPool,
  onDataRefresh
}) => {
  const [databasePokemons, setDatabasePokemons] = useState<Pokemon[]>([]);
  const [loadingDatabase, setLoadingDatabase] = useState(true);

  useEffect(() => {
    loadSchoolPokemons();
  }, [schoolId]);

  const loadSchoolPokemons = async () => {
    if (!schoolId) return;
    
    setLoadingDatabase(true);
    try {
      const pokemons = await getSchoolPokemonPool(schoolId);
      setDatabasePokemons(pokemons);
    } catch (error) {
      console.error('Error loading school pokemons:', error);
    } finally {
      setLoadingDatabase(false);
    }
  };

  const handleRefresh = () => {
    loadSchoolPokemons();
    onRefreshPool();
  };

  // Use database pokemons if available, otherwise fall back to localStorage
  const pokemonsToUse = databasePokemons.length > 0 ? databasePokemons : schoolPokemons;
  const isLoadingAny = loadingDatabase || isLoading;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
        <div className="mb-6">
          <Package className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">Mystery Ball</h2>
          <p className="text-purple-100">
            Open mystery balls to discover new Pokémon or earn coins!
          </p>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <p className="text-sm mb-2">Available Pokémon in pool:</p>
          <p className="text-2xl font-bold">
            {isLoadingAny ? "Loading..." : pokemonsToUse.length}
          </p>
        </div>

        <MysteryBallDatabase
          studentId={studentId}
          schoolId={schoolId}
          coins={coins}
          schoolPokemons={pokemonsToUse}
          onPokemonWon={onPokemonWon}
          onCoinsWon={onCoinsWon}
          onDataRefresh={onDataRefresh}
        />
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleRefresh}
          disabled={isLoadingAny}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingAny ? 'animate-spin' : ''}`} />
          Refresh Pool
        </Button>
      </div>

      <MysteryBallHistoryDatabase studentId={studentId} />
    </div>
  );
};

export default MysteryBallTab;
