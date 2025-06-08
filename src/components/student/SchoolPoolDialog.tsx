
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { getSchoolPokemonPool, initializeSchoolPokemonPool, updateAllSchoolPoolsTo500 } from "@/utils/pokemon/schoolPokemon";
import { Pokemon } from "@/types/pokemon";

interface SchoolPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  userType: "student" | "teacher";
}

const SchoolPoolDialog: React.FC<SchoolPoolDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  userType,
}) => {
  const { t } = useTranslation();
  const [pokemonPool, setPokemonPool] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && schoolId) {
      fetchSchoolPool();
    }
  }, [open, schoolId]);

  const fetchSchoolPool = () => {
    setLoading(true);
    try {
      console.log("Fetching school pool for schoolId:", schoolId);
      
      // First, ensure all school pools are updated to have 500 Pokemon
      updateAllSchoolPoolsTo500();
      
      // Try to get the existing pool
      let pool = getSchoolPokemonPool(schoolId);
      console.log("Retrieved pool:", pool);
      
      // If no pool exists, initialize it
      if (!pool) {
        console.log("No pool found, initializing new pool for school:", schoolId);
        pool = initializeSchoolPokemonPool(schoolId, 500);
        console.log("Initialized new pool:", pool);
      }

      if (pool && pool.availablePokemons && Array.isArray(pool.availablePokemons)) {
        console.log("Setting pokemon pool with", pool.availablePokemons.length, "pokemon");
        setPokemonPool(pool.availablePokemons);
      } else if (Array.isArray(pool)) {
        console.log("Pool is array format, setting directly");
        setPokemonPool(pool);
      } else {
        console.warn("Invalid or empty pool data:", pool);
        
        // Force create a new pool if we still don't have valid data
        const newPool = initializeSchoolPokemonPool(schoolId, 500);
        if (newPool && newPool.availablePokemons) {
          setPokemonPool(newPool.availablePokemons);
        } else {
          setPokemonPool([]);
        }
      }
    } catch (error) {
      console.error("Error fetching school pool:", error);
      
      // Try to recover by creating a new pool
      try {
        const recoveryPool = initializeSchoolPokemonPool(schoolId, 500);
        if (recoveryPool && recoveryPool.availablePokemons) {
          setPokemonPool(recoveryPool.availablePokemons);
        } else {
          setPokemonPool([]);
        }
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
        setPokemonPool([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "bg-yellow-500";
      case "rare":
        return "bg-purple-500";
      case "uncommon":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("school-pokemon-pool")} ({pokemonPool.length} Pokémon available)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p>{t("loading")}</p>
            </div>
          ) : pokemonPool.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t("no-pokemon-in-pool")}</p>
              <Button onClick={fetchSchoolPool} variant="outline">
                Refresh Pool
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pokemonPool.map((pokemon) => (
                <Card
                  key={pokemon.id}
                  className="bg-white/20 backdrop-blur-sm rounded-xl shadow-md"
                >
                  <CardContent className="p-4 flex flex-col items-center space-y-3">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <h3 className="font-semibold text-center">{pokemon.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{pokemon.type}</Badge>
                      <Badge className={`text-white ${getRarityColor(pokemon.rarity)}`}>
                        {pokemon.rarity}
                      </Badge>
                    </div>
                    {pokemon.level && (
                      <Badge variant="secondary">Level {pokemon.level}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              School ID: {schoolId}
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchSchoolPool} variant="outline">
                Refresh
              </Button>
              <Button onClick={() => onOpenChange(false)}>{t("close")}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolPoolDialog;
