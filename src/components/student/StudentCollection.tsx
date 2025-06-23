
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
      if (!studentId) {
        console.warn("No studentId provided to StudentCollection");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log("🔍 Fetching Pokemon for student:", studentId);
        
        // First, determine the correct user_id to use for Pokemon lookup
        let actualUserId = studentId;
        
        // Check if studentId is actually a user_id by looking in student_profiles
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('user_id, id')
          .eq('user_id', studentId)
          .maybeSingle();
        
        if (profileData) {
          // studentId is already a user_id, use it directly
          actualUserId = profileData.user_id;
          console.log("✅ Found student profile, using user_id:", actualUserId);
        } else {
          // Check if studentId is an ID from students table, get the user_id
          const { data: studentData } = await supabase
            .from('students')
            .select('user_id, id')
            .eq('id', studentId)
            .maybeSingle();
          
          if (studentData?.user_id) {
            actualUserId = studentData.user_id;
            console.log("✅ Found student record, using user_id:", actualUserId);
          } else {
            // Try using studentId as user_id directly as fallback
            console.log("⚠️ No specific student record found, trying studentId as user_id:", studentId);
            actualUserId = studentId;
          }
        }

        console.log("🔍 Final user_id for Pokemon lookup:", actualUserId);

        // Now fetch Pokemon using the correct user_id
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
          .eq('student_id', actualUserId);

        if (error) {
          console.error("❌ Error fetching Pokemon:", error);
          setPokemons([]);
          return;
        }

        console.log("📦 Raw Pokemon data from database:", pokemonData);

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

        console.log("✅ Transformed Pokemon for display:", transformedPokemons);
        setPokemons(transformedPokemons);
      } catch (error) {
        console.error("❌ Unexpected error fetching Pokemon:", error);
        setPokemons([]);
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
        ) : pokemons.length > 0 ? (
          <PokemonList pokemons={pokemons} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No Pokémon in your collection yet.</p>
            <p className="text-sm mt-2">Complete homework or use the Mystery Ball to get your first Pokémon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCollection;
