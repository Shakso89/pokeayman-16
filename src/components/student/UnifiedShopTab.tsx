
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, ShoppingCart, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { 
  getPokemonCatalog, 
  purchasePokemonFromShop, 
  type PokemonCatalogItem 
} from "@/services/pokemonService";

interface UnifiedShopTabProps {
  studentId: string;
  studentCoins: number;
  onDataUpdate: () => void;
}

const UnifiedShopTab: React.FC<UnifiedShopTabProps> = ({
  studentId,
  studentCoins,
  onDataUpdate
}) => {
  const { t } = useTranslation();
  const [pokemonCatalog, setPokemonCatalog] = useState<PokemonCatalogItem[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPokemonCatalog();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemonCatalog, searchTerm, selectedRarity]);

  const loadPokemonCatalog = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading Pokemon catalog for shop...");
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

    filtered.sort((a, b) => a.price - b.price);
    setFilteredPokemon(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPokemonCatalog();
    onDataUpdate();
    setRefreshing(false);
    toast.success("Shop refreshed!");
  };

  const handlePurchase = async (pokemon: PokemonCatalogItem) => {
    if (!studentId || studentId === 'undefined') {
      toast.error("Invalid student ID");
      return;
    }

    const price = pokemon.price || 15;
    
    if (studentCoins < price) {
      toast.error(`Not enough coins! You need ${price} coins but only have ${studentCoins}.`);
      return;
    }

    setPurchasing(pokemon.id);
    
    try {
      console.log("🛒 Attempting to purchase Pokemon:", pokemon.name, "for", price, "coins");
      
      const result = await purchasePokemonFromShop(studentId, pokemon.id);
      
      if (result.success) {
        toast.success(`Successfully purchased ${pokemon.name}! Added to your collection.`);
        
        // Refresh data immediately
        onDataUpdate();
        
        // Additional refresh after a short delay to ensure sync
        setTimeout(() => {
          onDataUpdate();
        }, 1000);
      } else {
        console.error("❌ Purchase failed:", result.error);
        toast.error(result.error || "Failed to purchase Pokemon");
      }
    } catch (error) {
      console.error("❌ Purchase error:", error);
      toast.error("An unexpected error occurred during purchase");
    } finally {
      setPurchasing(null);
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
      <div className="text-center py-8">
        <div className="text-gray-500">Loading shop...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Pokémon Shop
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
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{studentCoins} coins available</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
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
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredPokemon.length} of {pokemonCatalog.length} Pokémon
          </div>
        </CardContent>
      </Card>

      {/* Pokemon Grid */}
      {filteredPokemon.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPokemon.map((pokemon) => {
            const price = pokemon.price || 15;
            const canAfford = studentCoins >= price;
            const isPurchasing = purchasing === pokemon.id;

            return (
              <Card key={pokemon.id} className="hover:shadow-md transition-shadow">
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

                      {/* Price and Purchase */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          <span className="font-semibold text-sm">{price}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(pokemon)}
                          disabled={!canAfford || isPurchasing}
                          className={`w-full ${!canAfford ? 'opacity-50' : ''}`}
                        >
                          {isPurchasing ? "Buying..." : !canAfford ? "Can't Afford" : "Buy"}
                        </Button>
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
            <p className="text-gray-500">No Pokémon available in the shop.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedShopTab;
