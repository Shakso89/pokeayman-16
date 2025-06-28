import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClassData } from '@/types/pokemon';
import { StudentProfile } from '@/services/studentDatabase';
import { useToast } from '@/hooks/use-toast';
import { getStudentPokemonCollection } from '@/services/unifiedPokemonService';

export const useClassDetails = (classId: string) => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();

        if (classError) {
          console.error('Error fetching class data:', classError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load class details"
          });
          return;
        }

        setClassData(classData);

        // Fetch student profiles for the class
        const { data: studentProfiles, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('class_id', classId);

        if (studentError) {
          console.error('Error fetching student profiles:', studentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load student profiles"
          });
          return;
        }

        // Fetch additional details for each student
        const studentsWithPokemon = await Promise.all(
          studentProfiles.map(async (student) => {
            const pokemonCount = await fetchStudentPokemon(student.user_id);
            return { ...student, pokemonCount };
          })
        );

        setStudents(studentsWithPokemon);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, toast]);

  const fetchStudentPokemon = async (studentId: string) => {
    try {
      const collections = await getStudentPokemonCollection(studentId);
      return collections.length;
    } catch (error) {
      console.error('Error fetching student Pokemon:', error);
      return 0;
    }
  };

  return {
    classData,
    students,
    loading,
    refreshClassDetails: useEffect,
  };
};
