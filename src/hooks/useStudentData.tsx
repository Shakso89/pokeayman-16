
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

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      console.log("Loading student data for:", studentId);

      // First try to get from student_profiles
      let { data: profileData, error: profileError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", studentId)
        .single();

      if (profileError || !profileData) {
        console.log("No profile found, checking students table:", profileError);
        
        // Fallback to students table
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        if (studentError || !studentData) {
          console.error("Student not found in either table:", studentError);
          setError("Student not found");
          return;
        }

        // Sync student data to student_profiles
        const { data: syncedProfile, error: syncError } = await supabase
          .from("student_profiles")
          .upsert({
            user_id: studentData.id,
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

        if (syncError) {
          console.error("Error syncing profile:", syncError);
        }

        profileData = syncedProfile || {
          user_id: studentData.id,
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

      console.log("Student profile loaded:", profileData);

      setStudentInfo({
        id: studentId,
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

      // Load Pokemon collection
      const { data: pokemonData, error: pokemonError } = await supabase
        .from("student_pokemon_collection")
        .select(`
          *,
          pokemon_pool (
            id,
            name,
            image_url,
            type_1,
            type_2,
            rarity,
            power_stats
          )
        `)
        .eq("student_id", studentId);

      if (pokemonError) {
        console.error("Error loading Pokemon:", pokemonError);
      } else if (pokemonData) {
        const pokemonList = pokemonData.map(item => ({
          id: item.pokemon_pool.id,
          name: item.pokemon_pool.name,
          image: item.pokemon_pool.image_url,
          type: item.pokemon_pool.type_1,
          type2: item.pokemon_pool.type_2,
          rarity: item.pokemon_pool.rarity,
          powerStats: item.pokemon_pool.power_stats
        }));
        setPokemon(pokemonList);
      }

    } catch (err) {
      console.error("Error loading student data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { studentInfo, pokemon, loading, error };
};
