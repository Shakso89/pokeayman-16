import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { StudentPokemon } from '@/services/pokemonManagementService';

interface StudentPokemonGridProps {
  pokemon: StudentPokemon[];
  onRemove: (collectionId: string, pokemonName: string) => void;
  disabled?: boolean;
}

const StudentPokemonGrid: React.FC<StudentPokemonGridProps> = ({
  pokemon,
  onRemove,
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shop_purchase': return 'bg-green-100 text-green-800 border-green-200';
      case 'teacher_award': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mystery_ball': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'shop_purchase': return 'Shop';
      case 'teacher_award': return 'Award';
      case 'mystery_ball': return 'Mystery';
      default: return source;
    }
  };

  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>This student doesn't have any Pokemon yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {pokemon.map((studentPokemon) => {
        const poke = studentPokemon.pokemon_pool;
        if (!poke) return null;

        return (
          <Card key={studentPokemon.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Remove button */}
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(studentPokemon.id, poke.name)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

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

                {/* Rarity and source badges */}
                <div className="flex gap-1 flex-wrap">
                  <Badge 
                    className={`${getRarityColor(poke.rarity)} text-white font-medium text-xs`}
                  >
                    {poke.rarity}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`${getSourceColor(studentPokemon.source)} text-xs`}
                  >
                    {getSourceLabel(studentPokemon.source)}
                  </Badge>
                </div>

                {/* Awarded date */}
                <p className="text-xs text-muted-foreground">
                  Added: {new Date(studentPokemon.awarded_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentPokemonGrid;