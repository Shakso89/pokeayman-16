import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonActionModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
  actionType: "awarded" | "removed";
  studentName: string;
}

const PokemonActionModal: React.FC<PokemonActionModalProps> = ({ 
  pokemon, 
  isOpen, 
  onClose, 
  actionType, 
  studentName 
}) => {
  const { t } = useTranslation();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-yellow-500";
      case "rare": return "bg-purple-500";
      case "uncommon": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === "awarded" ? t("pokemon-awarded") : t("pokemon-removed")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {pokemon && (
            <>
              <div className="relative">
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{pokemon.name}</h3>
                <div className="flex justify-center gap-2 mb-2">
                  <Badge variant="outline">{pokemon.type}</Badge>
                  <Badge className={`text-white ${getRarityColor(pokemon.rarity)}`}>
                    {pokemon.rarity}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">
                  {actionType === "awarded" 
                    ? `${pokemon.name} ${t("has-been-awarded-to")} ${studentName}!`
                    : `${pokemon.name} ${t("has-been-removed-from")} ${studentName}.`
                  }
                </p>
              </div>
            </>
          )}
          <Button onClick={onClose} className="w-full">
            {t("ok")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonActionModal;
