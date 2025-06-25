
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingBag, Coins } from "lucide-react";
import { getPokemonPool, awardPokemonToStudent, type PokemonFromPool } from "@/services/unifiedPokemonService";
import { updateStudentCoins } from "@/services/studentDatabase";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface UnifiedPokemonShopProps {
  studentId: string;
  studentCoins: number;
  onPurchase?: () => void;
}

const UnifiedPokemonShop: React.FC<UnifiedPokemonShopProps> = ({
  studentId,
  studentCoins,
  onPurchase
}) => {
  const { t } = useTranslation();
  const [pokemon, setPokemon] = useState<PokemonFromPool[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonFromPool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string>("");

  useEffect(() => {
    fetchPokemonPool();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemon, searchTerm, selectedRarity]);

  const fetchPokemonPool = async () => {
    setLoading(true);
    try {
      console.log("🛒 Fetching site-wide Pokemon pool for shop...");
      const poolData = await getPokemonPool();
      console.log(`🛒 Fetched ${poolData.length} Pokemon from shared site pool`);
      setPokemon(poolData);
    } catch (error) {
      console.error("Error fetching Pokémon pool:", error);
      toast({
        title: t("error"),
        description: "Failed to load Pokémon shop",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

    // Sort by price
    filtered.sort((a, b) => a.price - b.price);

    setFilteredPokemon(filtered);
  };

  const handlePurchase = async (pokemon: PokemonFromPool) => {
    console.log("🛒 Starting purchase process:", { pokemonId: pokemon.id, pokemonName: pokemon.name, price: pokemon.price, studentCoins, studentId });

    if (studentCoins < pokemon.price) {
      console.error("❌ Not enough coins:", { required: pokemon.price, available: studentCoins });
      toast({
        title: t("error"),
        description: `Not enough coins! You need ${pokemon.price} coins but only have ${studentCoins}.`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(pokemon.id);

    try {
      // First, deduct coins from student
      console.log("💰 Deducting coins from student...");
      const coinsSuccess = await updateStudentCoins(studentId, -pokemon.price, `Purchased ${pokemon.name}`);
      
      if (!coinsSuccess) {
        console.error("❌ Failed to deduct coins from student");
        toast({
          title: t("error"),
          description: "Failed to deduct coins. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Coins deducted successfully");

      // Award a copy of the Pokémon to student's collection (original stays in shared pool)
      console.log("🎁 Awarding Pokemon copy to student collection...");
      const awardSuccess = await awardPokemonToStudent(studentId, pokemon.id, 'shop_purchase');

      if (!awardSuccess) {
        console.error("❌ Failed to award Pokemon copy to collection");
        
        // Refund coins if awarding failed
        console.log("💰 Refunding coins due to award failure...");
        await updateStudentCoins(studentId, pokemon.price, `Refund for failed ${pokemon.name} purchase`);
        
        toast({
          title: t("error"),
          description: "Failed to award Pokémon copy to your collection. Coins have been refunded.",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ Pokemon copy purchased successfully: ${pokemon.name}`);

      toast({
        title: "🎉 Purchase Successful!",
        description: `You bought ${pokemon.name} for ${pokemon.price} coins from the site pool!`,
      });
      
      if (onPurchase) {
        onPurchase();
      }

    } catch (error) {
      console.error("❌ Unexpected error during purchase:", error);
      
      // Attempt to refund coins on any error
      try {
        await updateStudentCoins(studentId, pokemon.price, `Refund for failed ${pokemon.name} purchase`);
        console.log("💰 Coins refunded due to error");
      } catch (refundError) {
        console.error("❌ Failed to refund coins:", refundError);
      }
      
      toast({
        title: t("error"),
        description: `Failed to purchase Pokémon: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setPurchasing("");
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700 border-gray-300';
      case 'uncommon': return 'text-green-700 border-green-300';
      case 'rare': return 'text-blue-700 border-blue-300';
      case 'legendary': return 'text-purple-700 border-purple-300';
      default: return 'text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site-Wide Pokémon Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading shared Pokemon pool...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🌍 Site-Wide Pokémon Shop
              <Badge variant="outline">{pokemon.length} Available</Badge>
            </span>
            <div className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">{studentCoins}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Purchase any Pokémon from our shared site-wide pool! Each Pokémon can be bought multiple times. 
            The pool is shared across all schools and contains {pokemon.length} unique Pokémon.
          </p>
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
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredPokemon.length} of {pokemon.length} Pokémon from shared pool
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
                <Badge className={`mt-1 text-xs ${getRarityColor(pokemon.rarity)}`}>
                  {pokemon.rarity}
                </Badge>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{pokemon.price}</span>
                </div>
              </div>
              <Button
                onClick={() => handlePurchase(pokemon)}
                disabled={studentCoins < pokemon.price || purchasing === pokemon.id}
                size="sm"
                className="w-full text-xs"
                variant={studentCoins >= pokemon.price ? "default" : "outline"}
              >
                {purchasing === pokemon.id ? (
                  "Purchasing..."
                ) : studentCoins >= pokemon.price ? (
                  <>
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Buy Copy
                  </>
                ) : (
                  "Not enough coins"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || selectedRarity !== "all" 
                ? "No Pokémon found matching your criteria." 
                : "No Pokémon available in the shared pool."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedPokemonShop;
