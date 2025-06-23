
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

        // Fetch student's Pokemon collection with full catalog data
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('pokemon_collections')
          .select(`
            *,
            pokemon_catalog!inner(*)
          `)
          .eq('student_id', studentId);

        if (pokemonError) throw pokemonError;

        // Transform the data to match Pokemon interface
        const transformedPokemons: Pokemon[] = (pokemonData || []).map((item: any) => ({
          id: item.pokemon_catalog.id,
          name: item.pokemon_catalog.name,
          image_url: item.pokemon_catalog.image || '',
          type_1: item.pokemon_catalog.type || 'normal',
          type_2: undefined,
          rarity: item.pokemon_catalog.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
          price: 15,
          description: undefined,
          power_stats: item.pokemon_catalog.power_stats
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
