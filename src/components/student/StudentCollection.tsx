
import React, { useEffect, useState } from "react";
import { Pokemon } from "@/types/pokemon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PokemonList from "./PokemonList";
import { supabase } from "@/integrations/supabase/client";

interface StudentCollectionProps {
  studentId: string;
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ studentId }) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemons = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        console.log("🔍 Fetching Pokemon for student:", studentId);
        
        // Get student to find the correct user_id
        const { data: student } = await supabase
          .from("students")
          .select("user_id")
          .or(`id.eq.${studentId},user_id.eq.${studentId}`)
          .maybeSingle();

        const lookupId = student?.user_id || studentId;
        console.log("🔍 Using lookup ID:", lookupId);

        const { data: pokemonData, error } = await supabase
          .from('pokemon_collections')
          .select(`
            id,
            pokemon_id,
            obtained_at,
            pokemon_catalog (
              id,
              name,
              image,
              type,
              rarity,
              power_stats
            )
          `)
          .eq('student_id', lookupId);

        if (error) {
          console.error("❌ Error fetching Pokemon:", error);
          return;
        }

        console.log("📦 Found Pokemon collections:", pokemonData?.length || 0);

        const transformedPokemons: Pokemon[] = (pokemonData || []).map(collection => {
          const pokemonCatalog = collection.pokemon_catalog as any;
          return {
            id: pokemonCatalog?.id || collection.pokemon_id,
            name: pokemonCatalog?.name || `Pokemon #${collection.pokemon_id}`,
            image: pokemonCatalog?.image || '',
            type: pokemonCatalog?.type || 'normal',
            rarity: pokemonCatalog?.rarity || 'common',
            powerStats: pokemonCatalog?.power_stats || {}
          };
        });

        console.log("✅ Transformed Pokemon:", transformedPokemons.length);
        setPokemons(transformedPokemons);
      } catch (error) {
        console.error("❌ Unexpected error fetching Pokemon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [studentId]);

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardTitle>My Pokémons ({pokemons.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-4">Loading Pokémon...</div>
        ) : (
          <PokemonList pokemons={pokemons} />
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCollection;
