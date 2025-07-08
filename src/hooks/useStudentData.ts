
import { useState, useEffect } from "react";
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

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

        // Fetch student's Pokemon collection with full pokemon pool data
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('student_pokemon_collection')
          .select(`
            *,
            pokemon_pool!fk_pokemon_pool (*)
          `)
          .eq('student_id', studentId);

        if (pokemonError) throw pokemonError;

        // Transform the data to match Pokemon interface
        const transformedPokemons: Pokemon[] = (pokemonData || []).map((item: any) => ({
          id: item.pokemon_pool.id,
          name: item.pokemon_pool.name,
          image_url: item.pokemon_pool.image_url || '',
          type_1: item.pokemon_pool.type_1 || 'normal',
          type_2: item.pokemon_pool.type_2,
          rarity: item.pokemon_pool.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
          price: item.pokemon_pool.price || 15,
          description: item.pokemon_pool.description,
          power_stats: item.pokemon_pool.power_stats
        }));

        setPokemon(transformedPokemons);
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
