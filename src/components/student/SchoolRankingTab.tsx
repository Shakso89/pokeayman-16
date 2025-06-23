import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Award, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";

interface SchoolRankingTabProps {
  schoolId: string;
}

interface Student {
  id: string;
  name: string;
  username: string;
  displayName: string;
  coins: number;
  pokemonCount: number;
  pokemons: Pokemon[];
  rank: number;
}

const SchoolRankingTab: React.FC<SchoolRankingTabProps> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolRanking = async () => {
      if (!schoolId) return;
      
      setLoading(true);
      try {
        console.log('Fetching school ranking for school:', schoolId);
        
        // Get students in this school
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, username, display_name, coins')
          .eq('school_id', schoolId)
          .eq('is_active', true);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }

        // Get Pokemon counts for each student
        const studentsWithCounts = await Promise.all(
          (studentsData || []).map(async (student) => {
            const { data: pokemonData } = await supabase
              .from('pokemon_collections')
              .select('*, pokemon_catalog!inner(*)')
              .eq('student_id', student.id);

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

            return {
              id: student.id,
              name: student.display_name || student.username,
              username: student.username,
              displayName: student.display_name || student.username,
              coins: student.coins || 0,
              pokemonCount: transformedPokemons.length,
              pokemons: transformedPokemons,
              rank: 0
            };
          })
        );

        // Sort by Pokemon count (descending) and assign ranks
        const sortedStudents = studentsWithCounts
          .sort((a, b) => b.pokemonCount - a.pokemonCount)
          .map((student, index) => ({
            ...student,
            rank: index + 1
          }));

        setStudents(sortedStudents);
      } catch (error) {
        console.error('Error fetching school ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolRanking();
  }, [schoolId]);

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No students in this school yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {students.map((student) => (
                <div key={student.id} className="flex items-center p-4">
                  <div className="mr-4 w-8 text-center">{student.rank}</div>
                  <Avatar className="mr-4 h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${student.username}.png`} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{student.displayName}</p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2">
                      <Badge variant="outline">
                        <Award className="mr-1.5 h-4 w-4" />
                        {student.pokemonCount}
                      </Badge>
                    </div>
                    <div>
                      <Badge>
                        <span className="mr-1">
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SchoolRankingTab;
