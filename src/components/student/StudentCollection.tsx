
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Star, Award } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection, type StudentPokemonCollection } from "@/services/pokemonService";

interface StudentCollectionProps {
  studentId: string;
  refreshTrigger?: number;
}

const StudentCollection: React.FC<StudentCollectionProps> = ({
  studentId,
  refreshTrigger = 0
}) => {
  const { t } = useTranslation();
  const [pokemonCollection, setPokemonCollection] = useState<StudentPokemonCollection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentCollection();
    }
  }, [studentId, refreshTrigger]);

  const fetchStudentCollection = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching collection for student:", studentId);
      const collection = await getStudentPokemonCollection(studentId);
      console.log("📦 Collection fetched:", collection);
      setPokemonCollection(collection);
    } catch (error) {
      console.error("Error fetching student collection:", error);
      setPokemonCollection([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'rare': return 'bg-purple-500 text-white';
      case 'uncommon': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'shop_purchase': return '🛒';
      case 'teacher_award': return '🎁';
      case 'mystery_ball': return '⚡';
      default: return '❓';
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6" />
          My Pokémon Collection ({pokemonCollection.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-4">Loading Pokémon...</div>
        ) : pokemonCollection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemonCollection.map((collection) => {
              const pokemon = collection.pokemon;
              if (!pokemon) return null;

              return (
                <Card key={collection.id} className="hover:shadow-md transition-shadow">
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
                          <Badge variant="outline" className="text-xs">
                            {pokemon.type_1}
                          </Badge>
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
                          <span className="text-xs text-gray-500" title={`Source: ${collection.source}`}>
                            {getSourceIcon(collection.source)}
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
            <p className="text-sm mt-2">Complete homework, use the Mystery Ball, or visit the shop to get your first Pokémon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCollection;
