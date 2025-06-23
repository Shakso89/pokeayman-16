
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Search } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { awardPokemonToStudent, getStudentPokemonCollection, removePokemonFromStudent } from '@/services/unifiedPokemonService';

interface StudentCollectionPokemon extends Pokemon {
  collectionId?: string;
}

interface ManagePokemonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onPokemonUpdated?: () => void;
}

const ManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  onPokemonUpdated
}) => {
  const [studentPokemons, setStudentPokemons] = useState<StudentCollectionPokemon[]>([]);
  const [availablePokemons, setAvailablePokemons] = useState<Pokemon[]>([]);
  const [selectedPokemonId, setSelectedPokemonId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'award' | 'remove'>('award');
  const { toast } = useToast();

  useEffect(() => {
    if (open && studentId) {
      loadStudentPokemon();
      loadAvailablePokemons();
    }
  }, [open, studentId]);

  const loadStudentPokemon = async () => {
    try {
      console.log('🔍 Loading student Pokemon collection for:', studentId);
      
      const collections = await getStudentPokemonCollection(studentId);
      console.log('📦 Student collections found:', collections.length);
      
      // Transform to match our interface
      const transformedPokemons: StudentCollectionPokemon[] = collections.map(collection => ({
        id: collection.pokemon?.id || collection.pokemon_id,
        name: collection.pokemon?.name || 'Unknown Pokemon',
        image_url: collection.pokemon?.image_url || '',
        type_1: collection.pokemon?.type_1 || 'normal',
        type_2: collection.pokemon?.type_2,
        rarity: collection.pokemon?.rarity || 'common',
        price: collection.pokemon?.price || 15,
        description: collection.pokemon?.description,
        power_stats: collection.pokemon?.power_stats,
        collectionId: collection.id
      }));
      
      console.log('✅ Transformed student Pokemon:', transformedPokemons.length);
      setStudentPokemons(transformedPokemons);
    } catch (error) {
      console.error('❌ Error loading student Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student's Pokémon collection"
      });
    }
  };

  const loadAvailablePokemons = async () => {
    try {
      console.log('🔍 Loading available Pokemon from unified pool...');
      
      const { data, error } = await supabase
        .from('pokemon_pool')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform the data to match Pokemon interface
      const transformedData: Pokemon[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Unknown',
        image_url: item.image_url || '',
        type_1: item.type_1 || 'normal',
        type_2: item.type_2,
        rarity: item.rarity || 'common',
        price: item.price || 15,
        description: item.description,
        power_stats: item.power_stats
      }));

      console.log('✅ Loaded available Pokemon:', transformedData.length);
      setAvailablePokemons(transformedData);
    } catch (error) {
      console.error('❌ Error loading available Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available Pokémon"
      });
    }
  };

  const handleAwardPokemon = async () => {
    if (!selectedPokemonId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a Pokémon to award"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🎁 Awarding Pokemon:', selectedPokemonId, 'to student:', studentId);
      
      const success = await awardPokemonToStudent(
        studentId,
        selectedPokemonId,
        'teacher_award'
      );

      if (success) {
        toast({
          title: "Success",
          description: `Pokémon awarded to ${studentName} successfully!`
        });
        
        await loadStudentPokemon();
        setSelectedPokemonId('');
        
        if (onPokemonUpdated) {
          onPokemonUpdated();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to award Pokémon"
        });
      }
    } catch (error) {
      console.error('❌ Error awarding Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while awarding Pokémon"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePokemon = async (pokemon: StudentCollectionPokemon) => {
    if (!pokemon.collectionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove Pokémon - missing collection ID"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Removing Pokemon collection:', pokemon.collectionId);
      
      const success = await removePokemonFromStudent(pokemon.collectionId);

      if (success) {
        toast({
          title: "Success",
          description: `${pokemon.name} removed from ${studentName}'s collection`
        });
        
        await loadStudentPokemon();
        
        if (onPokemonUpdated) {
          onPokemonUpdated();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove Pokémon"
        });
      }
    } catch (error) {
      console.error('❌ Error removing Pokemon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while removing Pokémon"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'rare': return 'bg-purple-500';
      case 'uncommon': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAvailablePokemons = availablePokemons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage {studentName}'s Pokémon Collection</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Action Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "award" ? "default" : "outline"}
              onClick={() => setActiveTab("award")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Award Pokémon
            </Button>
            <Button
              variant={activeTab === "remove" ? "default" : "outline"}
              onClick={() => setActiveTab("remove")}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Pokémon
            </Button>
          </div>

          {activeTab === "award" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Award New Pokémon</h3>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Available Pokémon</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search Pokémon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="pokemon-select">Select Pokémon</Label>
                  <Select value={selectedPokemonId} onValueChange={setSelectedPokemonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Pokémon" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailablePokemons.map((pokemon) => (
                        <SelectItem key={pokemon.id} value={pokemon.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getRarityColor(pokemon.rarity || 'common')}>
                              {pokemon.rarity}
                            </Badge>
                            {pokemon.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleAwardPokemon} 
                    disabled={loading || !selectedPokemonId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Award
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                {filteredAvailablePokemons.map((pokemon) => (
                  <Card key={pokemon.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center space-y-2">
                        <Badge 
                          variant="outline" 
                          className={`${getRarityColor(pokemon.rarity || 'common')} text-white`}
                        >
                          {pokemon.rarity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPokemonId(pokemon.id.toString())}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {pokemon.image_url && (
                        <div className="mb-2">
                          <img 
                            src={pokemon.image_url} 
                            alt={pokemon.name}
                            className="w-full h-32 object-contain bg-gray-50 rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                      
                      <h4 className="font-medium text-sm">{pokemon.name}</h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {pokemon.type_1}{pokemon.type_2 ? `/${pokemon.type_2}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "remove" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Current Collection ({studentPokemons.length} Pokémon)
              </h3>
              
              {studentPokemons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {studentName} doesn't have any Pokémon yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {studentPokemons.map((pokemon) => (
                    <Card key={`${pokemon.id}-${pokemon.collectionId}`} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge 
                            variant="outline" 
                            className={`${getRarityColor(pokemon.rarity || 'common')} text-white`}
                          >
                            {pokemon.rarity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePokemon(pokemon)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {pokemon.image_url && (
                          <div className="mb-2">
                            <img 
                              src={pokemon.image_url} 
                              alt={pokemon.name}
                              className="w-full h-32 object-contain bg-gray-50 rounded"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        )}
                        
                        <h4 className="font-medium text-sm">{pokemon.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {pokemon.type_1}{pokemon.type_2 ? `/${pokemon.type_2}` : ''}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePokemonDialog;
