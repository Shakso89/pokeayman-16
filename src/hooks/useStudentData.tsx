
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";

interface StudentInfo {
  id: string;
  display_name: string;
  username: string;
  coins: number;
  spent_coins: number;
  school_id: string;
  class_id: string;
  teacher_id: string;
  avatar_url?: string;
  school_name?: string;
}

export const useStudentData = (studentId: string) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to resolve student ID
  const resolveStudentId = async (inputId: string): Promise<string | null> => {
    if (!inputId) return null;
    
    // If it looks like a UUID, return as is
    if (inputId.includes('-') && inputId.length > 30) {
      return inputId;
    }

    // Try to find by username in students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, user_id, username')
      .eq('username', inputId)
      .single();
    
    if (studentData && !studentError) {
      return studentData.user_id || studentData.id;
    }

    return inputId; // fallback
  };

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading student data for:", studentId);

      // Resolve the student ID first
      const resolvedId = await resolveStudentId(studentId);
      if (!resolvedId) {
        setError("Could not resolve student ID");
        return;
      }

      console.log("Resolved student ID for data loading:", resolvedId);

      // First try to get from student_profiles
      let { data: profileData, error: profileError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", resolvedId)
        .single();

      if (profileError || !profileData) {
        console.log("No profile found, checking students table:", profileError);
        
        // Fallback to students table
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("user_id", resolvedId)
          .single();

        if (studentError || !studentData) {
          // Try by ID as final fallback
          const { data: idFallback, error: idError } = await supabase
            .from("students")
            .select("*")
            .eq("id", resolvedId)
            .single();

          if (idError || !idFallback) {
            console.error("Student not found in any table:", idError);
            setError("Student not found");
            return;
          }
          
          // Use ID fallback data
          profileData = {
            user_id: idFallback.user_id || idFallback.id,
            username: idFallback.username,
            display_name: idFallback.display_name || idFallback.username,
            coins: idFallback.coins || 0,
            spent_coins: 0,
            school_id: idFallback.school_id,
            class_id: idFallback.class_id,
            teacher_id: idFallback.teacher_id,
            avatar_url: idFallback.profile_photo,
            school_name: idFallback.school_name
          };
        } else {
          // Sync student data to student_profiles
          const { data: syncedProfile, error: syncError } = await supabase
            .from("student_profiles")
            .upsert({
              user_id: studentData.user_id || studentData.id,
              username: studentData.username,
              display_name: studentData.display_name || studentData.username,
              coins: studentData.coins || 0,
              spent_coins: 0,
              school_id: studentData.school_id,
              class_id: studentData.class_id,
              teacher_id: studentData.teacher_id,
              avatar_url: studentData.profile_photo,
              school_name: studentData.school_name
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          profileData = syncedProfile || {
            user_id: studentData.user_id || studentData.id,
            username: studentData.username,
            display_name: studentData.display_name || studentData.username,
            coins: studentData.coins || 0,
            spent_coins: 0,
            school_id: studentData.school_id,
            class_id: studentData.class_id,
            teacher_id: studentData.teacher_id,
            avatar_url: studentData.profile_photo,
            school_name: studentData.school_name
          };
        }
      }

      console.log("Student profile loaded:", profileData);

      setStudentInfo({
        id: resolvedId,
        display_name: profileData.display_name || profileData.username,
        username: profileData.username,
        coins: profileData.coins || 0,
        spent_coins: profileData.spent_coins || 0,
        school_id: profileData.school_id,
        class_id: profileData.class_id,
        teacher_id: profileData.teacher_id,
        avatar_url: profileData.avatar_url,
        school_name: profileData.school_name
      });

      // Load Pokemon collection using the unified service
      try {
        const { getStudentPokemonCollection } = await import('@/services/pokemonService');
        const pokemonData = await getStudentPokemonCollection(resolvedId);

        if (pokemonData) {
          const pokemonList = pokemonData.map(item => ({
            id: item.pokemon?.id || item.pokemon_id,
            name: item.pokemon?.name || `Pokemon #${item.pokemon_id}`,
            image: item.pokemon?.image_url || '/placeholder.svg',
            type: item.pokemon?.type_1 || 'normal',
            type2: item.pokemon?.type_2,
            rarity: item.pokemon?.rarity || 'common',
            powerStats: item.pokemon?.power_stats
          }));
          setPokemon(pokemonList);
          console.log(`✅ Loaded ${pokemonList.length} Pokemon for student data`);
        }
      } catch (pokemonError) {
        console.error("Error loading Pokemon collection:", pokemonError);
        setPokemon([]);
      }

    } catch (err) {
      console.error("Error loading student data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadStudentData();
  };

  return { studentInfo, pokemon, loading, error, refreshData };
};
