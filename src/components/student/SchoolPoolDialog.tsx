
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { getSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
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
  userType
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
      const pool = getSchoolPokemonPool(schoolId);
      setPokemonPool(pool || []);
    } catch (error) {
      console.error("Error fetching school pool:", error);
      setPokemonPool([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-yellow-500";
      case "rare": return "bg-purple-500";
      case "uncommon": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("school-pokemon-pool")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>{t("loading")}</p>
            </div>
          ) : pokemonPool.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("no-pokemon-in-pool")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pokemonPool.map((pokemon) => (
                <Card key={pokemon.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-2">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolPoolDialog;
