import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Award, User, XCircle } from "lucide-react"; // Added XCircle for error icon
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon"; // Assuming this path is correct

// --- Interfaces ---

interface SchoolRankingTabProps {
  schoolId: string;
}

// Streamlined Student interface:
// 'name' will be the primary display name, derived from 'display_name' or 'username'.
interface Student {
  id: string;
  name: string; // The name to display (display_name or username)
  username: string;
  coins: number;
  pokemonCount: number;
  // 'pokemons' array can be removed if only the count is needed for ranking display
  // If you need to show specific pokemons on hover/click, then keep it.
  // For ranking list, keeping it might be an unnecessary data load.
  // pokemons: Pokemon[];
  rank: number;
}

// --- Component ---

const SchoolRankingTab: React.FC<SchoolRankingTabProps> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // State to store error messages

  // useCallback to memoize the fetch function and prevent unnecessary re-creations
  const fetchSchoolRanking = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      // Optionally, set an error if schoolId is expected but missing
      // setError("School ID is missing. Cannot fetch ranking.");
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log('Fetching school ranking for school:', schoolId);

      // 1. Fetch Students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, username, display_name, coins')
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        setError(`Failed to load students: ${studentsError.message}`);
        setLoading(false);
        return;
      }

      if (!studentsData || studentsData.length === 0) {
        setStudents([]); // No students found
        setLoading(false);
        return;
      }

      // 2. Fetch Pokémon counts for each student concurrently
      // Using Promise.allSettled to ensure all promises resolve (or reject)
      // and we can process successful ones while noting failures.
      const studentsWithCountsPromises = studentsData.map(async (student) => {
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('pokemon_collections')
          .select('id') // Only select ID for count, more efficient
          .eq('student_id', student.id);

        if (pokemonError) {
          console.warn(`Error fetching Pokémon for student ${student.username}:`, pokemonError);
          // If fetching pokemon for a specific student fails,
          // we'll treat their pokemonCount as 0 for the ranking.
          return {
            id: student.id,
            name: student.display_name || student.username,
            username: student.username,
            coins: student.coins || 0,
            pokemonCount: 0,
            rank: 0, // Will be set later
          };
        }

        return {
          id: student.id,
          name: student.display_name || student.username,
          username: student.username,
          coins: student.coins || 0,
          pokemonCount: pokemonData ? pokemonData.length : 0,
          rank: 0, // Will be set later
        };
      });

      const settledResults = await Promise.allSettled(studentsWithCountsPromises);

      // Filter out rejected promises and get fulfilled student data
      const fulfilledStudents = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<Student>).value);

      // 3. Sort and Assign Ranks
      const sortedStudents = fulfilledStudents
        .sort((a, b) => b.pokemonCount - a.pokemonCount) // Sort descending by pokemonCount
        .map((student, index) => ({
          ...student,
          rank: index + 1, // Assign rank
        }));

      setStudents(sortedStudents);

    } catch (err) {
      console.error('An unexpected error occurred during ranking fetch:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [schoolId]); // Dependency array: re-run if schoolId changes

  // useEffect to call the fetch function when the component mounts or schoolId changes
  useEffect(() => {
    fetchSchoolRanking();
  }, [fetchSchoolRanking]); // Dependency on the memoized fetch function

  // --- Render Logic ---

  // Memoize the content to avoid re-rendering the entire list if nothing changes
  const rankingContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p>Loading school ranking...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-500 p-4 text-center">
          <XCircle className="h-10 w-10 mb-3" />
          <p className="font-semibold mb-2">Error:</p>
          <p>{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please ensure you have network access or contact support.</p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
          <User className="h-10 w-10 mb-3" />
          <p className="font-semibold">No students in this school yet.</p>
          <p className="text-sm">Check back later or add students to the school.</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border">
        {students.map((student) => (
          <div key={student.id} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
            <div className="mr-4 w-8 text-center font-bold text-lg">
              {student.rank}
            </div>
            <Avatar className="mr-4 h-12 w-12 border-2 border-primary/50"> {/* Slightly larger avatar with a border */}
              <AvatarImage
                src={`https://avatar.vercel.sh/${student.username}.png`}
                alt={`${student.name}'s avatar`}
              />
              <AvatarFallback delayMs={600}> {/* Add a small delay for better UX */}
                <User className="h-6 w-6 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">@{student.username}</p>
            </div>
            <div className="flex items-center space-x-3"> {/* Added space between badges */}
              <Badge variant="outline" className="px-3 py-1 text-base font-medium"> {/* Adjusted badge styling */}
                <Award className="mr-2 h-4 w-4 text-yellow-500" /> {/* Award icon for Pokémon count */}
                {student.pokemonCount}
              </Badge>
              <Badge className="px-3 py-1 text-base font-medium bg-green-600 hover:bg-green-700"> {/* Distinct color for coins */}
                <span className="mr-1">
                  {/* Inline SVG for coin icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 inline-block align-middle"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v3a3 3 0 003 3h10.5a3 3 0 003-3v-3a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-7.5 8.25A3.75 3.75 0 1112 15.75a3.75 3.75 0 017.5 0V18h.75a.75.75 0 010 1.5h-15a.75.75 0 010-1.5H4.5v-2.25zm4.875-7.312A1.875 1.875 0 109.375 9.375a1.875 1.875 0 003.75 0V6h1.5v3.375a3.75 3.75 0 01-7.5 0V2.438z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {student.coins}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  }, [loading, error, students]); // Dependencies for memoization

  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] w-full"> {/* Ensure ScrollArea takes full width */}
          {rankingContent}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SchoolRankingTab;
