import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  getPokemonPool,
  purchasePokemonFromShop,
  type PokemonFromPool
} from "@/services/unifiedPokemonService";
import { updateStudentCoins } from "@/services/studentDatabase";

interface PokemonShopProps {
  studentId: string;
  coins: number;
  onPurchase: (pokemon: PokemonFromPool, cost: number) => void;
  onRefresh: () => void;
}

const PokemonShop: React.FC<PokemonShopProps> = ({
  studentId,
  coins,
  onPurchase,
  onRefresh
}) => {
  const { t } = useTranslation();
  const [pokemonPool, setPokemonPool] = useState<PokemonFromPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPokemonPool();
  }, []);

  const loadPokemonPool = async () => {
    setLoading(true);
    try {
      const pool = await getPokemonPool();
      setPokemonPool(pool);
    } catch (error) {
      console.error("Error loading Pokemon pool:", error);
      toast.error("Failed to load Pokemon shop");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pokemon: PokemonFromPool) => {
    if (coins < pokemon.price) {
      toast.error(`You need ${pokemon.price} coins to buy ${pokemon.name}!`);
      return;
    }

    setPurchasing(pokemon.id);

    try {
      // Deduct coins first
      const coinsSuccess = await updateStudentCoins(studentId, -pokemon.price, `Purchased ${pokemon.name}`);
      
      if (!coinsSuccess) {
        toast.error("Failed to deduct coins");
        return;
      }

      // Purchase the Pokemon
      const result = await purchasePokemonFromShop(studentId, pokemon.id, pokemon.price);
      
      if (result.success) {
        toast.success(`Successfully purchased ${pokemon.name}!`);
        onPurchase(pokemon, pokemon.price);
        onRefresh();
      } else {
        toast.error(result.error || "Failed to purchase Pokemon");
        // Refund coins on failure
        await updateStudentCoins(studentId, pokemon.price, `Refund for failed ${pokemon.name} purchase`);
      }
    } catch (error) {
      console.error("Error purchasing Pokemon:", error);
      toast.error("Purchase failed");
      // Refund coins on error
      await updateStudentCoins(studentId, pokemon.price, `Refund for failed ${pokemon.name} purchase`);
    } finally {
      setPurchasing(null);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <ShoppingCart className="mr-2 inline-block h-5 w-5" />
            Pokémon Shop
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            Purchase Pokémon with your coins!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center">Loading Pokémon...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pokemonPool.map((pokemon) => (
                <Card key={pokemon.id}>
                  <CardContent className="flex flex-col items-center justify-between p-4">
                    <div className="space-y-2 text-center">
                      <img
                        src={pokemon.image_url || "/placeholder.svg"}
                        alt={pokemon.name}
                        className="h-24 w-24 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <h3 className="text-lg font-semibold">{pokemon.name}</h3>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline">{pokemon.type_1}</Badge>
                        {pokemon.type_2 && (
                          <Badge variant="outline">{pokemon.type_2}</Badge>
                        )}
                      </div>
                      <Badge className={getRarityColor(pokemon.rarity)}>
                        {pokemon.rarity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between w-full mt-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Coins className="h-4 w-4" />
                        {pokemon.price}
                      </div>
                      <Button
                        onClick={() => handlePurchase(pokemon)}
                        disabled={coins < pokemon.price || purchasing === pokemon.id}
                        className="w-auto"
                        size="sm"
                      >
                        {purchasing === pokemon.id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Purchasing...
                          </div>
                        ) : (
                          "Buy"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Sparkles className="mr-2 inline-block h-5 w-5" />
            Shop Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">💰 Pricing:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Common: 5-15 coins</li>
                  <li>• Uncommon: 15-25 coins</li>
                  <li>• Rare: 25-50 coins</li>
                  <li>• Legendary: 100+ coins</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">🛍️ Purchase Rules:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Buy any Pokémon multiple times</li>
                  <li>• Instant delivery to collection</li>
                  <li>• All 300 Pokémon available</li>
                  <li>• Earn coins from activities</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-xs">
                <strong>New System:</strong> The shop now features the complete unified pool of 300 Pokémon!
                You can purchase any Pokémon multiple times to build your ultimate collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PokemonShop;
