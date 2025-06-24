
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Trophy, School, Users, Loader2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StudentWithRank, Pokemon } from "@/types/pokemon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// --- Interfaces ---

interface School {
  id: string;
  name: string;
  created_at?: string;
  top_student_id?: string;
}

interface RankedStudent {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  coins: number;
  pokemon_count: number;
  total_score: number;
  rank: number;
  school_name?: string;
  class_id?: string;
}

// --- RankingPage Component ---

const RankingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- State Management ---
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolStudents, setSchoolStudents] = useState<RankedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RankedStudent | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- User Context from Local Storage ---
  const userType = useMemo(() => localStorage.getItem("userType") as "teacher" | "student", []);
  const userId = useMemo(() => userType === "teacher" ? localStorage.getItem("teacherId") : localStorage.getItem("studentId"), [userType]);
  const userSchoolId = useMemo(() => localStorage.getItem("studentSchoolId") || localStorage.getItem("teacherSchoolId") || "", []);

  // --- Navigation Handlers ---
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStudentProfileClick = useCallback((studentId: string) => {
    navigate(`/student-profile/${studentId}`);
  }, [navigate]);

  // --- Data Fetching Functions ---

  const loadAllSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: schoolsError } = await supabase.from('schools').select('*');
      if (schoolsError) throw schoolsError;
      setSchools(data || []);
    } catch (err: any) {
      console.error("Error loading schools:", err.message);
      setError(`Failed to load schools: ${err.message}`);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSchoolStudents = useCallback(async (schoolId: string) => {
    setError(null);
    try {
      console.log('Fetching students for school:', schoolId);

      // Get student profiles for the school
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_profiles')
        .select('id, user_id, username, display_name, coins, avatar_url, school_id, class_id')
        .eq('school_id', schoolId);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      if (!studentsData || studentsData.length === 0) {
        setSchoolStudents([]);
        return;
      }

      // Get Pokemon counts for each student
      const studentsWithPokemon = await Promise.all(studentsData.map(async (student) => {
        const { data: pokemonData } = await supabase
          .from('student_pokemon_collection')
          .select('id')
          .eq('student_id', student.user_id);

        const pokemonCount = pokemonData?.length || 0;
        const totalScore = student.coins + (pokemonCount * 3); // Pokemon worth 3 points each

        return {
          id: student.user_id,
          user_id: student.user_id,
          username: student.username,
          display_name: student.display_name || student.username,
          avatar_url: student.avatar_url,
          coins: student.coins || 0,
          pokemon_count: pokemonCount,
          total_score: totalScore,
          rank: 0, // Will be set after sorting
          class_id: student.class_id
        };
      }));

      // Sort by total score and assign ranks
      const sortedStudents = studentsWithPokemon
        .sort((a, b) => b.total_score - a.total_score)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));

      setSchoolStudents(sortedStudents);
    } catch (err: any) {
      console.error("Error loading school students:", err.message);
      setError(`Failed to load school students: ${err.message}`);
      setSchoolStudents([]);
    }
  }, []);

  const handleStudentClick = useCallback(async (student: RankedStudent) => {
    setSelectedStudent(student);
    setStudentPokemons([]);
    setError(null);
    try {
      const { data, error: pokemonError } = await supabase
        .from('student_pokemon_collection')
        .select(`
          *,
          pokemon_pool (
            id,
            name,
            image_url,
            type_1,
            type_2,
            rarity,
            price,
            description,
            power_stats
          )
        `)
        .eq('student_id', student.user_id);

      if (pokemonError) throw pokemonError;

      const pokemons: Pokemon[] = (data || []).map((item: any) => ({
        id: item.pokemon_pool.id,
        name: item.pokemon_pool.name,
        image_url: item.pokemon_pool.image_url || '',
        type_1: item.pokemon_pool.type_1 || 'normal',
        type_2: item.pokemon_pool.type_2,
        rarity: item.pokemon_pool.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        price: item.pokemon_pool.price || 0,
        description: item.pokemon_pool.description,
        power_stats: item.pokemon_pool.power_stats
      }));

      setStudentPokemons(pokemons);
    } catch (err: any) {
      console.error("Error loading student pokemon:", err.message);
      setError(`Failed to load Pokémon collection: ${err.message}`);
      setStudentPokemons([]);
    }
  }, []);

  // --- Effects ---

  useEffect(() => {
    loadAllSchools();
  }, [loadAllSchools]);

  useEffect(() => {
    if (selectedSchool) {
      loadSchoolStudents(selectedSchool.id);
    }
  }, [selectedSchool, loadSchoolStudents]);

  // --- Helper Functions for Rendering ---

  const getRankingColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-amber-700 text-white";
    return "bg-gray-200 text-gray-700";
  };

  const renderStudentList = useCallback((studentList: RankedStudent[]) => {
    if (!studentList || studentList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Users className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">{t("no-students-found")}</p>
          <p className="mt-2 text-sm">{t("try-another-school")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {studentList.map(student => (
          <div
            key={student.id}
            className="flex items-center p-4 border rounded-lg shadow-sm hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            onClick={() => handleStudentClick(student)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${getRankingColor(student.rank)}`}>
              {student.rank <= 3 ? <Trophy size={20} className="drop-shadow-sm" /> : student.rank}
            </div>

            <div className="flex-1 flex items-center">
              <Avatar className="h-12 w-12 mr-4 border-2 border-primary/30">
                <AvatarImage src={student.avatar_url || `https://avatar.vercel.sh/${student.username}.png`} alt={`${student.display_name}'s avatar`} />
                <AvatarFallback delayMs={600}>
                  {student.display_name?.substring(0, 2).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>

              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStudentProfileClick(student.id);
                  }}
                  className="font-semibold text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {student.display_name}
                </button>
                <p className="text-sm text-muted-foreground">@{student.username}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <p className="font-bold text-xl text-primary">{student.total_score} {t("points")}</p>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                  {student.pokemon_count} {t("pokemon")}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 inline-block align-middle mr-1 text-green-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v3a3 3 0 003 3h10.5a3 3 0 003-3v-3a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-7.5 8.25A3.75 3.75 0 1112 15.75a3.75 3.75 0 017.5 0V18h.75a.75.75 0 010 1.5h-15a.75.75 0 010-1.5H4.5v-2.25zm4.875-7.312A1.875 1.875 0 109.375 9.375a1.875 1.875 0 003.75 0V6h1.5v3.375a3.75 3.75 0 01-7.5 0V2.438z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {student.coins} {t("coins")}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [handleStudentClick, handleStudentProfileClick, getRankingColor, t]);

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NavBar userType={userType} userName={userType === "teacher" ? localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") : localStorage.getItem("studentName") || ""} />

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBackClick} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {selectedSchool ? `${selectedSchool.name} - ${t("rankings")}` : t("school-rankings")}
          </h1>
          {selectedSchool && (
            <Button variant="ghost" onClick={() => setSelectedSchool(null)} className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              {t("back-to-schools")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl">{t("loading-data")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-red-500 p-4 text-center border border-red-300 rounded-lg bg-red-50">
            <XCircle className="h-16 w-16 mb-4" />
            <p className="text-xl font-semibold mb-2">{t("error-loading")}</p>
            <p>{error}</p>
            <Button onClick={() => loadAllSchools()} className="mt-4">
              {t("retry")}
            </Button>
          </div>
        ) : !selectedSchool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.length > 0 ? (
              schools.map(school => (
                <Card
                  key={school.id}
                  className="cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col"
                  onClick={() => setSelectedSchool(school)}
                >
                  <CardHeader className="pb-2 flex-grow">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <School className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {school.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-0">
                    <Button className="mt-4 w-full">
                      {t("view-rankings")}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <School className="mx-auto h-16 w-16 mb-4" />
                <p className="text-2xl font-semibold">{t("no-schools-available")}</p>
                <p className="mt-2 text-base">{t("contact-admin-to-add-schools")}</p>
              </div>
            )}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-2xl">{t("top-students")} - {selectedSchool.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {renderStudentList(schoolStudents)}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Pokemon Collection Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedStudent?.display_name}'s {t("pokemon-collection")} ({studentPokemons.length})
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedStudent && studentPokemons.length > 0 ? (
              <PokemonList pokemons={studentPokemons} onPokemonClick={pokemon => setSelectedPokemon(pokemon)} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <img src="/pokeball.png" alt="No Pokémon" className="mx-auto w-24 h-24 mb-4 opacity-75" />
                <p className="text-lg font-semibold">{t("no-pokemon-found")}</p>
                <p className="mt-2 text-sm">{t("this-student-has-not-collected-any-pokemon-yet")}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Pokémon View Modal */}
      <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedPokemon?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPokemon && (
            <div className="flex flex-col items-center p-4">
              <img src={selectedPokemon.image_url} alt={selectedPokemon.name} className="w-56 h-56 object-contain mb-6 transition-transform duration-300 hover:scale-105" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-lg">
                <div className="flex flex-col items-center sm:items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("type")}:</p>
                  <Badge variant="secondary" className="mt-1 text-base">{selectedPokemon.type_1}</Badge>
                </div>
                {selectedPokemon.type_2 && (
                  <div className="flex flex-col items-center sm:items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("secondary-type")}:</p>
                    <Badge variant="secondary" className="mt-1 text-base">{selectedPokemon.type_2}</Badge>
                  </div>
                )}
                <div className="flex flex-col items-center sm:items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("rarity")}:</p>
                  <Badge variant="secondary" className="mt-1 text-base">{selectedPokemon.rarity}</Badge>
                </div>
                <div className="flex flex-col items-center sm:items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("price")}:</p>
                  <Badge variant="secondary" className="mt-1 text-base">{selectedPokemon.price} {t("coins")}</Badge>
                </div>
              </div>
              {selectedPokemon.description && (
                <div className="mt-6 w-full text-center sm:text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("description")}:</p>
                  <p className="mt-1 text-base text-gray-800 dark:text-gray-200">{selectedPokemon.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingPage;
