
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Coins, Filter } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { getUnifiedPokemonPool, purchasePokemonFromShop } from '@/services/unifiedPokemonService';
import { useToast } from '@/hooks/use-toast';

interface PokemonShopProps {
  studentId: string;
  studentCoins: number;
  onPurchaseComplete: () => void;
}

const PokemonShop: React.FC<PokemonShopProps> = ({
  studentId,
  studentCoins,
  onPurchaseComplete
}) => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadPokemonPool();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemon, searchTerm, rarityFilter]);

  const loadPokemonPool = async () => {
    setLoading(true);
    try {
      const data = await getUnifiedPokemonPool();
      setPokemon(data);
    } catch (error) {
      console.error('Error loading Pokemon pool:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load Pokemon shop"
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

    if (rarityFilter !== 'all') {
      filtered = filtered.filter(p => p.rarity === rarityFilter);
    }

    setFilteredPokemon(filtered);
  };

  const handlePurchase = async (pokemonData: Pokemon) => {
    if (studentCoins < pokemonData.price) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${pokemonData.price} coins to purchase ${pokemonData.name}`
      });
      return;
    }

    setPurchasing(pokemonData.id);
    try {
      const result = await purchasePokemonFromShop(studentId, pokemonData.id);

      if (result.success) {
        if (result.error) {
          // This is the duplicate case
          toast({
            title: "Duplicate Pokemon!",
            description: result.error
          });
        } else {
          toast({
            title: "Purchase Successful!",
            description: `You purchased ${pokemonData.name} for ${pokemonData.price} coins!`
          });
        }
        onPurchaseComplete();
      } else {
        toast({
          variant: "destructive",
          title: "Purchase Failed",
          description: result.error || "Failed to purchase Pokemon"
        });
      }
    } catch (error) {
      console.error('Error purchasing Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
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

  const getPriceColor = (price: number) => {
    if (studentCoins >= price) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Pokemon Shop
          </CardTitle>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold">{studentCoins} Coins</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Pokemon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPokemon.map((pokemonData) => (
              <Card key={pokemonData.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                      <img
                        src={pokemonData.image_url || '/placeholder-pokemon.png'}
                        alt={pokemonData.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{pokemonData.name}</h3>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <Badge variant="outline" className="text-xs">
                          {pokemonData.type_1}
                        </Badge>
                        {pokemonData.type_2 && (
                          <Badge variant="outline" className="text-xs">
                            {pokemonData.type_2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Badge className={`${getRarityColor(pokemonData.rarity)} w-fit`}>
                      {pokemonData.rarity}
                    </Badge>

                    {pokemonData.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {pokemonData.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${getPriceColor(pokemonData.price)}`}>
                        {pokemonData.price} coins
                      </span>
                      <Button
                        onClick={() => handlePurchase(pokemonData)}
                        disabled={purchasing === pokemonData.id || studentCoins < pokemonData.price}
                        size="sm"
                      >
                        {purchasing === pokemonData.id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Buying...
                          </div>
                        ) : (
                          'Buy'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPokemon.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || rarityFilter !== 'all' 
                ? 'No Pokemon found matching your filters' 
                : 'No Pokemon available in the shop'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PokemonShop;
