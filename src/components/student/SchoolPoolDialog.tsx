
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

interface SchoolPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolPokemons: Pokemon[];
}

const SchoolPoolDialog: React.FC<SchoolPoolDialogProps> = ({ 
  open, 
  onOpenChange, 
  schoolPokemons 
}) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t("school-pokemon-pool") || "School Pokémon Pool"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between mb-4 items-center">
            <p className="text-sm font-medium">
              {t("available-pokemon") || "Available Pokémon"}: {schoolPokemons.length}
            </p>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[70vh] overflow-y-auto p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            {schoolPokemons.slice(0, 96).map((pokemon) => (
              <div key={pokemon.id} className="text-center group hover-scale">
                <div className={`bg-white p-2 rounded-lg shadow-sm border-2 ${
                  pokemon.rarity === 'legendary' ? 'border-yellow-500 hover:border-yellow-400' :
                  pokemon.rarity === 'rare' ? 'border-purple-500 hover:border-purple-400' :
                  pokemon.rarity === 'uncommon' ? 'border-blue-500 hover:border-blue-400' : 
                  'border-green-500 hover:border-green-400'
                } transition-all duration-200 transform hover:scale-105`}>
                  <img 
                    src={pokemon.image} 
                    alt={pokemon.name} 
                    className="w-16 h-16 object-contain mx-auto" 
                  />
                  <div className="mt-1 p-1 bg-gray-100 rounded-md">
                    <p className="text-xs font-medium truncate">{pokemon.name}</p>
                    <p className="text-xs text-gray-500">{pokemon.type}</p>
                    <span className={`inline-block px-1 py-0.5 rounded-full text-[10px] text-white ${
                      pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                      pokemon.rarity === 'rare' ? 'bg-purple-500' :
                      pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {pokemon.rarity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {schoolPokemons.length > 96 && (
              <div className="col-span-full text-center py-4 text-gray-500 text-sm bg-white/50 rounded-lg">
                {t("and-more-pokemon") || 
                  `And ${schoolPokemons.length - 96} more Pokémon...`
                }
              </div>
            )}
            
            {schoolPokemons.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                {t("no-pokemon-in-pool") || "No Pokémon available in the school pool."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolPoolDialog;
