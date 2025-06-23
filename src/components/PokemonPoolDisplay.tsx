
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Award, ShoppingBag } from "lucide-react";
import { getPokemonPool, getPokemonPoolStats, awardPokemonToStudent, type PokemonFromPool } from "@/services/unifiedPokemonService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface PokemonPoolDisplayProps {
  showActions?: boolean;
  onAwardPokemon?: (pokemonId: string, pokemonName: string) => void;
  studentId?: string;
}

const PokemonPoolDisplay: React.FC<PokemonPoolDisplayProps> = ({ 
  showActions = false, 
  onAwardPokemon,
  studentId 
}) => {
  const { t } = useTranslation();
  const [pokemon, setPokemon] = useState<PokemonFromPool[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonFromPool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ total: 0, byRarity: {} });

  useEffect(() => {
    fetchPokemonPool();
    fetchStats();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemon, searchTerm, selectedRarity]);

  const fetchPokemonPool = async () => {
    setLoading(true);
    try {
      const poolData = await getPokemonPool();
      setPokemon(poolData);
    } catch (error) {
      console.error("Error fetching Pokémon pool:", error);
      toast({
        title: t("error"),
        description: "Failed to load Pokémon pool",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getPokemonPoolStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching pool stats:", error);
    }
  };

  const filterPokemon = () => {
    let filtered = pokemon;

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

    setFilteredPokemon(filtered);
  };

  const handleAwardPokemon = async (pokemon: PokemonFromPool) => {
    if (!studentId) {
      toast({
        title: t("error"),
        description: "No student selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await awardPokemonToStudent(studentId, pokemon.id, 'teacher_award');
      if (success) {
        toast({
          title: t("success"),
          description: `${pokemon.name} awarded successfully!`,
        });
        if (onAwardPokemon) {
          onAwardPokemon(pokemon.id, pokemon.name);
        }
      } else {
        throw new Error("Failed to award Pokémon");
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to award Pokémon",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'legendary': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'uncommon': return 'text-green-700';
      case 'rare': return 'text-blue-700';
      case 'legendary': return 'text-purple-700';
      default: return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pokémon Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading Pokémon pool...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Pokémon Pool Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pokémon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.byRarity?.common || 0}</div>
              <div className="text-sm text-gray-600">Common</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{stats.byRarity?.uncommon || 0}</div>
              <div className="text-sm text-gray-600">Uncommon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.byRarity?.rare || 0}</div>
              <div className="text-sm text-gray-600">Rare</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.byRarity?.legendary || 0}</div>
              <div className="text-sm text-gray-600">Legendary</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Pokémon by name or type..."
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
        </CardContent>
      </Card>

      {/* Pokémon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredPokemon.map((pokemon) => (
          <Card key={pokemon.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={pokemon.image_url || "/placeholder.svg"}
                  alt={pokemon.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                <h3 className="font-semibold text-sm">{pokemon.name}</h3>
                <div className="flex justify-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {pokemon.type_1}
                  </Badge>
                  {pokemon.type_2 && (
                    <Badge variant="outline" className="text-xs">
                      {pokemon.type_2}
                    </Badge>
                  )}
                </div>
                <Badge 
                  className={`mt-1 text-xs ${getRarityColor(pokemon.rarity)} text-white`}
                >
                  {pokemon.rarity}
                </Badge>
                <div className="text-xs text-gray-600 mt-1">
                  {pokemon.price} coins
                </div>
              </div>
              {showActions && (
                <Button
                  onClick={() => handleAwardPokemon(pokemon)}
                  size="sm"
                  className="w-full text-xs"
                  variant="outline"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Award
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No Pokémon found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PokemonPoolDisplay;
