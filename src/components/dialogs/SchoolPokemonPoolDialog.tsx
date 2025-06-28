import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { getPokemonPool, PokemonFromPool } from "@/services/unifiedPokemonService";

interface SchoolPokemonPoolDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
}

const SchoolPokemonPoolDialog: React.FC<SchoolPokemonPoolDialogProps> = ({
  isOpen,
  onOpenChange,
  schoolId,
}) => {
  const { t } = useTranslation();
  const [pokemonPool, setPokemonPool] = useState<PokemonFromPool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pokemonData = await getPokemonPool();
      setPokemonPool(pokemonData || []);
    } catch (error) {
      console.error("Error fetching Pokemon pool:", error);
      setPokemonPool([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("school-pokemon-pool")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {pokemonPool.length} Pokémon available in the unified pool.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          ) : pokemonPool.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No Pokémon available in the pool.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pokemonPool.map((pokemon) => (
                <Card key={pokemon.id} className="relative">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={pokemon.image_url}
                        alt={pokemon.name}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <h3 className="font-semibold text-center">{pokemon.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">{pokemon.type_1}</Badge>
                        {pokemon.type_2 && <Badge variant="outline">{pokemon.type_2}</Badge>}
                        <Badge className={`text-white ${getRarityColor(pokemon.rarity)}`}>
                          {pokemon.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolPokemonPoolDialog;
