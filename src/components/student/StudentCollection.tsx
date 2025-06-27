
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection, type StudentPokemonCollectionItem } from "@/services/pokemonService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentCollectionProps {
  studentId: string;
  refreshTrigger?: number;
}

const StudentCollection: React.FC<StudentCollectionProps> = ({
  studentId,
  refreshTrigger = 0
}) => {
  const { t } = useTranslation();
  const [pokemonCollection, setPokemonCollection] = useState<StudentPokemonCollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentCollection = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log("🔍 StudentCollection: Fetching for studentId:", studentId);

    if (!studentId || studentId === 'undefined') {
      console.warn("❌ StudentCollection: Invalid studentId provided:", studentId);
      setPokemonCollection([]);
      setLoading(false);
      return;
    }

    try {
      const collection = await getStudentPokemonCollection(studentId);
      console.log("📦 StudentCollection: Fetched successfully:", collection.length);
      setPokemonCollection(collection);
    } catch (err: any) {
      console.error("❌ StudentCollection: Error fetching:", err);
      setError(err.message || "Failed to load Pokémon collection.");
      setPokemonCollection([]);
      toast.error(err.message || "Failed to load Pokémon collection.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId || studentId === 'undefined') {
      setPokemonCollection([]);
      setLoading(false);
      return;
    }

    fetchStudentCollection();

    // Set up real-time subscription
    const channel = supabase
      .channel(`student-pokemon-changes-${studentId}`)
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
          fetchStudentCollection();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, refreshTrigger, fetchStudentCollection]);

  const handleRefresh = () => {
    fetchStudentCollection();
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'shop_purchase': return '🛒';
      case 'teacher_award': return '🎁';
      case 'event_reward': return '🎉';
      default: return '⭐';
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            My Pokémon Collection ({pokemonCollection.length})
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading Pokémon...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        ) : pokemonCollection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemonCollection.map((collectionItem) => {
              const pokemon = collectionItem.pokemon || collectionItem.pokemon_catalog;

              if (!pokemon) {
                console.warn("Pokemon data missing for collection item:", collectionItem.id);
                return null;
              }

              return (
                <Card key={collectionItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-2">
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

                      <div className="space-y-1">
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
                          {pokemon.rarity && (
                            <Badge className={`${getRarityColor(pokemon.rarity)} text-xs`}>
                              {pokemon.rarity}
                            </Badge>
                          )}
                        </div>

                        <div className="text-center">
                          <span className="text-xs text-gray-500" title={`Source: ${collectionItem.source}`}>
                            {getSourceIcon(collectionItem.source)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No Pokémon in your collection yet.</p>
            <p className="text-sm mt-2">Complete homework or visit the shop to get your first Pokémon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCollection;
