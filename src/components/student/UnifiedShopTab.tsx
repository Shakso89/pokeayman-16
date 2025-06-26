
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { purchasePokemonFromShop, type PokemonCatalogItem } from "@/services/pokemonService";
import { getStudentCoinsEnhanced } from "@/services/enhancedCoinService";

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
  const [pokemonPool, setPokemonPool] = useState<PokemonCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [currentCoins, setCurrentCoins] = useState(studentCoins);
  const { toast } = useToast();

  useEffect(() => {
    loadPokemonPool();
    loadCurrentCoins();
  }, [studentId]);

  useEffect(() => {
    setCurrentCoins(studentCoins);
  }, [studentCoins]);

  const loadCurrentCoins = async () => {
    try {
      const coinData = await getStudentCoinsEnhanced(studentId);
      setCurrentCoins(coinData.coins);
    } catch (error) {
      console.error("Error loading current coins:", error);
    }
  };

  const loadPokemonPool = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pokemon_catalog')
        .select('*')
        .order('rarity', { ascending: false })
        .order('name');

      if (error) throw error;
      setPokemonPool(data || []);
    } catch (error) {
      console.error("Error loading Pokemon pool:", error);
      toast({
        title: "Error",
        description: "Failed to load Pokemon shop",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pokemon: PokemonCatalogItem) => {
    // Re-fetch current coins to ensure we have the latest balance
    const latestCoinData = await getStudentCoinsEnhanced(studentId);
    const latestCoins = latestCoinData.coins;
    
    console.log("🛒 Starting purchase process:", { 
      pokemonId: pokemon.id, 
      pokemonName: pokemon.name, 
      price: pokemon.price, 
      latestCoins, 
      studentId 
    });

    if (latestCoins < pokemon.price) {
      console.error("❌ Not enough coins:", { required: pokemon.price, available: latestCoins });
      toast({
        title: "Insufficient Coins",
        description: `You need ${pokemon.price} coins but only have ${latestCoins}`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(pokemon.id);
    try {
      const result = await purchasePokemonFromShop(studentId, pokemon.id, pokemon.price);

      if (result.success) {
        toast({
          title: "Purchase Successful! 🎉",
          description: `You bought ${pokemon.name} for ${pokemon.price} coins!`,
        });

        // Update current coins display immediately
        const newCoins = latestCoins - pokemon.price;
        setCurrentCoins(newCoins);
        
        // Trigger parent component data refresh
        onDataUpdate();
      } else {
        console.error("❌ Purchase failed:", result.error);
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to purchase Pokemon",
          variant: "destructive"
        });
        
        // Reload coins in case there was a partial update
        await loadCurrentCoins();
      }
    } catch (error) {
      console.error("Error purchasing Pokemon:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during purchase",
        variant: "destructive"
      });
      
      // Reload coins in case there was a partial update
      await loadCurrentCoins();
    } finally {
      setPurchasing(null);
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Your Coins</h3>
              <div className="flex items-center gap-2 mt-2">
                <Coins className="h-6 w-6" />
                <span className="text-2xl font-bold">{currentCoins}</span>
              </div>
            </div>
            <ShoppingCart className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Pokémon Shop ({pokemonPool.length} available)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pokemonPool.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No Pokémon available in the shop right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pokemonPool.map((pokemon) => (
                <Card key={pokemon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
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

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold text-yellow-600">{pokemon.price}</span>
                          </div>
                          
                          <Button
                            onClick={() => handlePurchase(pokemon)}
                            disabled={currentCoins < pokemon.price || purchasing === pokemon.id}
                            className="w-full"
                            size="sm"
                          >
                            {purchasing === pokemon.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Buying...
                              </>
                            ) : currentCoins < pokemon.price ? (
                              "Not enough coins"
                            ) : (
                              "Buy"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedShopTab;
