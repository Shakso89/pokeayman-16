
import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { 
  getOrCreateStudentProfile, 
  getStudentProfileById,
  StudentProfile 
} from '@/services/studentDatabase';
import { getStudentPokemonCollection } from '@/utils/pokemon/studentPokemon';
import { supabase } from '@/integrations/supabase/client';
import { getStudentCoins } from '@/services/studentCoinService';

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

      // If we have userId, try to get or create profile
      if (userId) {
        studentProfile = await getOrCreateStudentProfile(userId, undefined, schoolId);
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

        // Load Pokemon collection using the correct user_id
        console.log("🔍 Loading Pokemon for user_id:", studentProfile.user_id);
        const pokemonCollection = await getStudentPokemonCollection(studentProfile.user_id);
        if (pokemonCollection) {
          setPokemons(pokemonCollection.map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            type: p.type,
            rarity: p.rarity,
          })));
        } else {
          setPokemons([]);
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
      const coinData = await getStudentCoins(studentId);
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
