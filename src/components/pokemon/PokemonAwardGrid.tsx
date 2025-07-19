import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Pokemon } from '@/services/pokemonManagementService';

interface PokemonAwardGridProps {
  pokemon: Pokemon[];
  onAward: (pokemonId: string, pokemonName: string) => void;
  disabled?: boolean;
}

const PokemonAwardGrid: React.FC<PokemonAwardGridProps> = ({
  pokemon,
  onAward,
  disabled = false
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'rare': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 'uncommon': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    return 'text-white font-medium';
  };

  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No Pokemon available in the pool.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {pokemon.map((poke) => (
        <Card key={poke.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            {/* Pokemon Image */}
            <div className="relative mb-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
              {poke.image_url ? (
                <img
                  src={poke.image_url}
                  alt={poke.name}
                  className="w-full h-full object-contain max-w-[80px] max-h-[80px]"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Pokemon Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm truncate">{poke.name}</h3>
              
              {/* Type badges */}
              <div className="flex gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {poke.type_1}
                </Badge>
                {poke.type_2 && (
                  <Badge variant="outline" className="text-xs">
                    {poke.type_2}
                  </Badge>
                )}
              </div>

              {/* Rarity badge */}
              <Badge 
                className={`${getRarityColor(poke.rarity)} ${getRarityTextColor(poke.rarity)} text-xs`}
              >
                {poke.rarity}
              </Badge>

              {/* Award button */}
              <Button
                onClick={() => onAward(poke.id, poke.name)}
                disabled={disabled}
                className="w-full mt-3"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Award
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PokemonAwardGrid;