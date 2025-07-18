
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection, type StudentPokemon } from "@/services/pokemonManagementService";

interface StudentCollectionProps {
  studentId: string;
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ studentId }) => {
  const { t } = useTranslation();
  const [pokemonCollection, setPokemonCollection] = useState<StudentPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollection = async () => {
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      setLoading(false);
      setError("Invalid student ID");
      return;
    }

    try {
      console.log("🔄 Loading Pokemon collection for student:", studentId);
      setError(null);
      
      const collection = await getStudentPokemonCollection(studentId);
      
      console.log("✅ Pokemon collection loaded:", collection?.length || 0);
      setPokemonCollection(collection || []);
    } catch (error) {
      console.error("❌ Error loading Pokemon collection:", error);
      setError("Failed to load Pokemon collection");
      setPokemonCollection([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (studentId && studentId !== 'undefined') {
        setLoading(true);
        await loadCollection();
      } else {
        if (mounted) {
          setLoading(false);
          setError("No student ID provided");
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [studentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollection();
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shop_purchase': return 'bg-green-100 text-green-800';
      case 'teacher_award': return 'bg-blue-100 text-blue-800';
      case 'mystery_ball': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading your collection...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Trophy className="h-16 w-16 text-red-300" />
            <div>
              <p className="text-red-500 font-medium">{error}</p>
              <Button onClick={handleRefresh} className="mt-2">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
            if (!pokemon) {
              console.warn("⚠️ Missing pokemon_pool data for item:", item);
              return null;
            }

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                      <img
                        src={pokemon.image_url || '/placeholder.svg'}
                        alt={pokemon.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

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

                      <div className="flex justify-center">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSourceColor(item.source)}`}
                        >
                          {getSourceLabel(item.source)}
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
