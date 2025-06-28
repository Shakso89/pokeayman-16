
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface StudentCollectionProps {
  studentId: string;
}

interface PokemonCollectionItem {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_at: string;
  source: string;
  pokemon_pool?: {
    id: string;
    name: string;
    image_url?: string;
    type_1: string;
    type_2?: string;
    rarity: string;
    price: number;
    description?: string;
    power_stats?: any;
  };
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ studentId }) => {
  const { t } = useTranslation();
  const [pokemonCollection, setPokemonCollection] = useState<PokemonCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollection = async () => {
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Loading Pokemon collection for student:", studentId);
      
      // Fetch from student_pokemon_collection table with proper join
      const { data: collection, error } = await supabase
        .from('student_pokemon_collection')
        .select(`
          id,
          student_id,
          pokemon_id,
          awarded_at,
          source,
          pokemon_pool!student_pokemon_collection_pokemon_id_fkey (
            id,
            name,
            image_url,
            type_1,
            type_2,
            rarity,
            price,
            description,
            power_stats
          )
        `)
        .eq('student_id', studentId)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error("❌ Error loading Pokemon collection:", error);
        setPokemonCollection([]);
      } else {
        console.log("✅ Pokemon collection loaded:", collection?.length || 0);
        
        // Transform the data to handle the foreign key relationship correctly
        const processedCollection = (collection || []).map(item => ({
          ...item,
          pokemon_pool: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool
        }));
        
        setPokemonCollection(processedCollection);
      }
    } catch (error) {
      console.error("❌ Unexpected error loading Pokemon collection:", error);
      setPokemonCollection([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
  }, [studentId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!studentId || studentId === 'undefined') return;

    console.log("🔄 Setting up real-time subscription for Pokemon collection");

    const channel = supabase
      .channel('student-pokemon-collection')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_pokemon_collection',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          console.log('🔄 Real-time Pokemon collection update:', payload);
          loadCollection();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollection();
    setRefreshing(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'rare': return 'bg-purple-500 text-white';
      case 'uncommon': return 'bg-blue-500 text-white';
      case 'common': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading your collection...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              My Pokémon Collection ({pokemonCollection.length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {pokemonCollection.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pokemonCollection.map((item) => {
            const pokemon = item.pokemon_pool;
            if (!pokemon) return null;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Pokemon Image */}
                    <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                      <img
                        src={pokemon.image_url || '/placeholder-pokemon.png'}
                        alt={pokemon.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    {/* Pokemon Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-center">{pokemon.name}</h3>
                      
                      <div className="flex justify-center gap-1">
                        {pokemon.type_1 && (
                          <Badge variant="outline" className="text-xs">
                            {pokemon.type_1}
                          </Badge>
                        )}
                        {pokemon.type_2 && (
                          <Badge variant="outline" className="text-xs">
                            {pokemon.type_2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <Badge className={`${getRarityColor(pokemon.rarity)} text-xs`}>
                          {pokemon.rarity}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {item.source.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Trophy className="h-16 w-16 text-gray-300" />
              <div>
                <p className="text-gray-500 font-medium">No Pokémon in your collection yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete homework or visit the shop to get your first Pokémon!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCollection;
