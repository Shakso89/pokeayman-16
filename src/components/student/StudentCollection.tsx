
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
// Import the corrected types and service function from your pokemonService.ts
import { getStudentPokemonCollection, type StudentPokemonCollectionItem } from "@/services/pokemonService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // For user notifications

interface StudentCollectionProps {
  studentId: string;
  refreshTrigger?: number; // Optional prop to manually trigger a re-fetch
}

const StudentCollection: React.FC<StudentCollectionProps> = ({
  studentId,
  refreshTrigger = 0
}) => {
  const { t } = useTranslation();
  // State to hold the fetched Pokémon collection data
  const [pokemonCollection, setPokemonCollection] = useState<StudentPokemonCollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // To display any fetch errors

  // Memoized function to fetch the student's Pokémon collection
  const fetchStudentCollection = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous errors

    if (!studentId) {
      console.warn("fetchStudentCollection: No studentId provided.");
      setPokemonCollection([]);
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Fetching student's Pokemon collection for:", studentId);
      // Call the service function to get the collection
      const collection = await getStudentPokemonCollection(studentId);
      console.log("📦 Collection fetched successfully:", collection);
      setPokemonCollection(collection);
    } catch (err: any) {
      console.error("❌ Error fetching student collection:", err);
      setError(err.message || "Failed to load Pokémon collection.");
      setPokemonCollection([]); // Clear collection on error
      toast.error(err.message || "Failed to load Pokémon collection."); // Notify the user
    } finally {
      setLoading(false);
    }
  }, [studentId]); // This function depends on studentId, so it recreates if studentId changes

  // useEffect to trigger the initial fetch and set up real-time subscriptions
  useEffect(() => {
    // If studentId is not available, we can't fetch.
    if (!studentId) {
      setPokemonCollection([]);
      setLoading(false);
      return;
    }

    // Perform the initial data fetch
    fetchStudentCollection();

    // Set up real-time subscription for immediate updates
    const channel = supabase
      .channel(`student-pokemon-changes-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pokemon_collections',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          console.log('🔄 Real-time Pokemon collection update detected:', payload);
          fetchStudentCollection();
        }
      )
      .subscribe();

    // Cleanup function: unsubscribe from the real-time channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, refreshTrigger, fetchStudentCollection]);

  // Handler for the manual refresh button
  const handleRefresh = () => {
    fetchStudentCollection(); // Simply calls the memoized fetch function
  };

  // Helper function to determine rarity badge color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'rare': return 'bg-purple-500 text-white';
      case 'uncommon': return 'bg-blue-500 text-white';
      case 'common': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get an icon based on the Pokémon's source
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
              const pokemon = collectionItem.pokemon_catalog;

              if (!pokemon) {
                console.warn("Pokemon data missing for collection item with ID:", collectionItem.id);
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
