
import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { 
  getOrCreateStudentProfile, 
  getStudentPokemonCollection, 
  getStudentProfileById,
  StudentProfile 
} from '@/services/studentDatabase';
import { supabase } from '@/integrations/supabase/client';
import { getStudentCoinData } from '@/services/studentCoinService';

export const useStudentData = (studentId: string, userId?: string, username?: string, schoolId?: string) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolName, setSchoolName] = useState<string>("");

  const loadStudentData = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      let studentProfile: StudentProfile | null = null;

      // If we have userId and username, try to get or create profile
      if (userId && username) {
        studentProfile = await getOrCreateStudentProfile(userId, username, undefined, schoolId);
      } else {
        // Otherwise get existing profile by student ID
        studentProfile = await getStudentProfileById(studentId);
      }

      if (studentProfile) {
        // Get legacy student ID via username, as it's used in some parts of the app
        const { data: legacyStudent } = await supabase
          .from('students')
          .select('id')
          .eq('username', studentProfile.username)
          .maybeSingle();
        const legacyId = legacyStudent?.id;

        // Fetch all class enrollments for the student using legacy ID
        let classEnrollments: { class_id: string }[] | null = null;
        if (legacyId) {
          const { data, error } = await supabase
            .from('student_classes')
            .select('class_id')
            .eq('student_id', legacyId);
          if (!error) classEnrollments = data;
        }
        
        let classIds: string | null = null;
        if (classEnrollments && classEnrollments.length > 0) {
          classIds = classEnrollments.map(c => c.class_id).join(',');
        } else if (studentProfile.class_id) {
          // Fallback to single class_id from profile if no entries in student_classes
          classIds = studentProfile.class_id;
        }

        const fullProfile = {
          ...studentProfile,
          class_id: classIds,
        };

        setProfile(fullProfile);

        // Load Pokemon collection using both user_id and legacy_id to handle data inconsistency
        let orFilter = `student_id.eq.${studentProfile.user_id}`;
        if (legacyId) {
          orFilter += `,student_id.eq.${legacyId}`;
        }
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('pokemon_collections')
          .select('*')
          .or(orFilter)
          .order('obtained_at', { ascending: false });

        if (pokemonError) {
          console.error("Error fetching pokemons:", pokemonError);
          setPokemons([]);
        } else {
          // Ensure we don't have duplicate Pokemon from querying with two IDs
          const uniquePokemons = pokemonData.filter((p, index, self) =>
            index === self.findIndex((t) => t.pokemon_id === p.pokemon_id)
          );
          setPokemons(uniquePokemons.map(item => ({
            id: item.pokemon_id,
            name: item.pokemon_name,
            image: item.pokemon_image || '',
            type: item.pokemon_type || '',
            rarity: (item.pokemon_rarity as any) || 'common',
          })));
        }

        // Load school name if school_id exists
        if (fullProfile.school_id) {
          try {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name')
              .eq('id', fullProfile.school_id)
              .maybeSingle();
            
            if (schoolData) {
              setSchoolName(schoolData.name);
            }
          } catch (error) {
            console.error('Error loading school name:', error);
            setSchoolName("Unknown School");
          }
        }
      }

      // Load coin data using centralized service
      const coinData = await getStudentCoinData(studentId);
      setCoins(coinData.coins);
      setSpentCoins(coinData.spentCoins);

      // If no profile found in Supabase but we have local data
      if (!studentProfile) {
        console.warn(`Student profile for ${studentId} not found in Supabase, using coin data only.`);
        
        // Also try to get student info from 'students' table for display name, etc.
        const { data: studentData } = await supabase.from('students').select('display_name, school_id').eq('id', studentId).maybeSingle();
        if (studentData && studentData.school_id) {
            try {
                const { data: schoolData } = await supabase
                .from('schools')
                .select('name')
                .eq('id', studentData.school_id)
                .maybeSingle();
                
                if (schoolData) {
                  setSchoolName(schoolData.name);
                }
            } catch (error) {
                console.error('Error loading school name from fallback:', error);
                setSchoolName("Unknown School");
            }
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadStudentData();
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId, userId, username, schoolId]);

  return {
    profile,
    pokemons,
    coins,
    spentCoins,
    schoolName,
    isLoading,
    refreshData
  };
};
