
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Award, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getAllPokemon, awardPokemonToStudent, type Pokemon } from "@/services/pokemonManagementService";

interface PokemonPoolDisplayProps {
  showActions?: boolean;
  studentId?: string;
  onAwardPokemon?: (pokemonId: string, pokemonName: string) => void;
}

const PokemonPoolDisplay: React.FC<PokemonPoolDisplayProps> = ({
  showActions = false,
  studentId,
  onAwardPokemon
}) => {
  const [pokemonCatalog, setPokemonCatalog] = useState<PokemonCatalogItem[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState<string>("");

  useEffect(() => {
    loadPokemonCatalog();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemonCatalog, searchTerm, selectedRarity]);

  const loadPokemonCatalog = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading Pokemon catalog...");
      const catalog = await getPokemonCatalog();
      console.log("✅ Pokemon catalog loaded:", catalog.length);
      setPokemonCatalog(catalog);
    } catch (error) {
      console.error("❌ Error loading Pokemon catalog:", error);
      toast.error("Failed to load Pokemon catalog");
    } finally {
      setLoading(false);
    }
  };

  const filterPokemon = () => {
    let filtered = pokemonCatalog;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type_2 && p.type_2.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRarity !== "all") {
      filtered = filtered.filter(p => p.rarity === selectedRarity);
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredPokemon(filtered);
  };

  const handleAwardPokemon = async (pokemon: PokemonCatalogItem) => {
    if (!studentId) {
      toast.error("No student selected");
      return;
    }

    setAwarding(pokemon.id);

    try {
      console.log("🎁 Awarding Pokemon:", pokemon.name, "to student:", studentId);
      
      const teacherId = localStorage.getItem("teacherId");
      const result = await awardPokemonToStudent(studentId, pokemon.id, teacherId || undefined);

      if (result.success) {
        toast.success(`Successfully awarded ${pokemon.name}!`);
        
        if (onAwardPokemon) {
          onAwardPokemon(pokemon.id, pokemon.name);
        }
      } else {
        console.error("❌ Award failed:", result.error);
        toast.error(result.error || "Failed to award Pokemon");
      }
    } catch (error) {
      console.error("❌ Award error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setAwarding("");
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Pokemon Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading Pokemon...</p>
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
              Pokemon Pool
              <Badge variant="outline">{pokemonCatalog.length} Available</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadPokemonCatalog}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Pokemon by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedRarity} onValueChange={setSelectedRarity}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="common">Common</TabsTrigger>
                <TabsTrigger value="uncommon">Uncommon</TabsTrigger>
                <TabsTrigger value="rare">Rare</TabsTrigger>
                <TabsTrigger value="legendary">Legendary</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Showing {filteredPokemon.length} of {pokemonCatalog.length} Pokemon
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPokemon.map((pokemon) => (
              <Card key={pokemon.id} className="hover:shadow-md transition-shadow">
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

                      {showActions && (
                        <Button
                          size="sm"
                          onClick={() => handleAwardPokemon(pokemon)}
                          disabled={awarding === pokemon.id || !studentId}
                          className="w-full"
                        >
                          {awarding === pokemon.id ? (
                            "Awarding..."
                          ) : (
                            <>
                              <Award className="h-3 w-3 mr-1" />
                              Award
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPokemon.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm || selectedRarity !== "all" 
                  ? "No Pokemon found matching your criteria." 
                  : "No Pokemon available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PokemonPoolDisplay;
