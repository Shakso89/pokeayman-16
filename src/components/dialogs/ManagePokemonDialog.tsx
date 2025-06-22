
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Loader2, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Pokemon {
  id: number;
  name: string;
  image?: string;
  type?: string;
  rarity?: string;
}

interface StudentPokemon extends Pokemon {
  collection_id?: string;
  obtained_at?: string;
}

interface ManagePokemonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  schoolId: string;
}

const ManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  schoolId
}) => {
  const [studentPokemon, setStudentPokemon] = useState<StudentPokemon[]>([]);
  const [availablePokemon, setAvailablePokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [awarding, setAwarding] = useState<number | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, studentId, schoolId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStudentPokemon(),
        loadAvailablePokemon()
      ]);
    } catch (error) {
      console.error("Error loading Pokemon data:", error);
      toast({
        title: "Error",
        description: "Failed to load Pokémon data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPokemon = async () => {
    try {
      const { data, error } = await supabase
        .from('pokemon_collections')
        .select(`
          id,
          pokemon_id,
          obtained_at,
          pokemon_catalog!inner(
            id,
            name,
            image,
            type,
            rarity
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;

      const pokemonList = data?.map(item => ({
        id: item.pokemon_catalog.id,
        name: item.pokemon_catalog.name,
        image: item.pokemon_catalog.image,
        type: item.pokemon_catalog.type,
        rarity: item.pokemon_catalog.rarity,
        collection_id: item.id,
        obtained_at: item.obtained_at
      })) || [];

      setStudentPokemon(pokemonList);
    } catch (error) {
      console.error("Error loading student Pokemon:", error);
      throw error;
    }
  };

  const loadAvailablePokemon = async () => {
    try {
      // Load all Pokemon from catalog that could be awarded
      const { data, error } = await supabase
        .from('pokemon_catalog')
        .select('id, name, image, type, rarity')
        .order('name');

      if (error) throw error;

      setAvailablePokemon(data || []);
    } catch (error) {
      console.error("Error loading available Pokemon:", error);
      throw error;
    }
  };

  const awardPokemon = async (pokemonId: number) => {
    setAwarding(pokemonId);
    try {
      const { error } = await supabase
        .from('pokemon_collections')
        .insert({
          student_id: studentId,
          pokemon_id: pokemonId,
          school_id: schoolId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pokémon awarded successfully!"
      });

      await loadStudentPokemon();
    } catch (error) {
      console.error("Error awarding Pokemon:", error);
      toast({
        title: "Error",
        description: "Failed to award Pokémon",
        variant: "destructive"
      });
    } finally {
      setAwarding(null);
    }
  };

  const removePokemon = async (collectionId: string) => {
    setRemoving(collectionId);
    try {
      const { error } = await supabase
        .from('pokemon_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pokémon removed successfully!"
      });

      await loadStudentPokemon();
    } catch (error) {
      console.error("Error removing Pokemon:", error);
      toast({
        title: "Error",
        description: "Failed to remove Pokémon",
        variant: "destructive"
      });
    } finally {
      setRemoving(null);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-purple-100 text-purple-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'uncommon':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPokemonCard = (pokemon: Pokemon, isOwned: boolean = false, collectionId?: string) => (
    <Card key={`${pokemon.id}-${collectionId || 'available'}`} className="relative">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-2 flex items-center justify-center bg-gray-50 rounded-lg">
            {pokemon.image ? (
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Award className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <h4 className="font-medium text-sm mb-1">{pokemon.name}</h4>
          
          {pokemon.type && (
            <Badge variant="outline" className="text-xs mb-1">
              {pokemon.type.charAt(0).toUpperCase() + pokemon.type.slice(1)}
            </Badge>
          )}
          
          {pokemon.rarity && (
            <Badge className={`text-xs mb-2 ${getRarityColor(pokemon.rarity)}`}>
              {pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1)}
            </Badge>
          )}

          {isOwned && collectionId ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removePokemon(collectionId)}
              disabled={removing === collectionId}
              className="w-full"
            >
              {removing === collectionId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Minus className="w-4 h-4 mr-1" />
                  Remove
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => awardPokemon(pokemon.id)}
              disabled={awarding === pokemon.id}
              className="w-full"
            >
              {awarding === pokemon.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Award
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Pokémon - {studentName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collection">
              Student's Collection ({studentPokemon.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Award Pokémon ({availablePokemon.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : studentPokemon.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {studentPokemon.map(pokemon => 
                  renderPokemonCard(pokemon, true, pokemon.collection_id)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No Pokémon in collection yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : availablePokemon.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availablePokemon.map(pokemon => 
                  renderPokemonCard(pokemon, false)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No Pokémon available to award</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePokemonDialog;
