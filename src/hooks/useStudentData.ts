
import { useState, useEffect } from "react";
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { getStudentPokemonCollection } from "@/services/unifiedPokemonService";

export const useStudentData = (studentId: string | null) => {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student info
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();

        if (studentError) throw studentError;
        setStudentInfo(student);

        // Fetch student's Pokemon collection using unified service
        console.log('🔍 Fetching Pokemon collection using unified service...');
        const pokemonCollections = await getStudentPokemonCollection(studentId);

        // Transform the data to match Pokemon interface
        const transformedPokemons: Pokemon[] = pokemonCollections.map((collection: any) => ({
          id: collection.pokemon_pool?.id || collection.pokemon_id,
          name: collection.pokemon_pool?.name || 'Unknown Pokemon',
          image_url: collection.pokemon_pool?.image_url || '',
          type_1: collection.pokemon_pool?.type_1 || 'normal',
          type_2: collection.pokemon_pool?.type_2,
          rarity: collection.pokemon_pool?.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
          price: collection.pokemon_pool?.price || 15,
          description: collection.pokemon_pool?.description,
          power_stats: collection.pokemon_pool?.power_stats
        }));

        setPokemon(transformedPokemons);
        console.log('✅ Unified Pokemon data loaded:', transformedPokemons.length);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  return { studentInfo, pokemon, loading, error };
};
