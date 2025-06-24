
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Trophy, School, Users, Loader2, XCircle } from "lucide-react"; // Added Loader2 and XCircle
import { useNavigate } from "react-router-dom";
import { StudentWithRank, Pokemon } from "@/types/pokemon"; // Ensure StudentWithRank matches the actual data structure
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList"; // Assuming this component exists
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SchoolRankingTab from "@/components/student/SchoolRankingTab"; // This seems to be a separate component for school-wide ranking
import { supabase } from "@/integrations/supabase/client";

// --- Interfaces ---

interface School {
  id: string;
  name: string;
  code: string;
  location?: string;
}

interface Class {
  id: string;
  name: string;
}

// --- RankingPage Component ---

const RankingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- State Management ---
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolStudents, setSchoolStudents] = useState<StudentWithRank[]>([]); // Renamed from 'students' for clarity
  const [classStudents, setClassStudents] = useState<{ [key: string]: StudentWithRank[] }>({});
  const [classes, setClasses] = useState<Class[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<StudentWithRank | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const [currentTab, setCurrentTab] = useState<'school' | 'class'>('school');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- User Context from Local Storage ---
  const userType = useMemo(() => localStorage.getItem("userType") as "teacher" | "student", []);
  const userId = useMemo(() => userType === "teacher" ? localStorage.getItem("teacherId") : localStorage.getItem("studentId"), [userType]);
  const userClassId = useMemo(() => localStorage.getItem("studentClassId") || "", []);
  const userSchoolId = useMemo(() => localStorage.getItem("studentSchoolId") || localStorage.getItem("teacherSchoolId") || "", []);

  // --- Navigation Handlers ---
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleStudentProfileClick = useCallback((studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  }, [navigate]);

  // --- Data Fetching Functions ---

  const fetchSchoolData = useCallback(async (id: string): Promise<School | null> => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error(`Error fetching school ${id}:`, error.message);
      return null;
    }
    return data as School;
  }, []);

  const fetchStudentProfilesAndPokemonCounts = useCallback(async (
    profileQuery: ReturnType<typeof supabase['from']['students']['select']>,
    limitResults: number | null = null
  ): Promise<StudentWithRank[]> => {
    const { data: profilesData, error: profilesError } = await profileQuery;

    if (profilesError) throw profilesError;
    if (!profilesData || profilesData.length === 0) return [];

    const profileUserIds = profilesData.map(p => p.user_id);

    const { data: pokemonCollections, error: pokemonError } = await supabase
      .from('pokemon_collections')
      .select('student_id')
      .in('student_id', profileUserIds);

    if (pokemonError) console.warn("Error fetching pokemon collections for ranking:", pokemonError.message);

    const pokemonCounts = new Map<string, number>();
    if (pokemonCollections) {
      pokemonCollections.forEach(p => {
        pokemonCounts.set(p.student_id, (pokemonCounts.get(p.student_id) || 0) + 1);
      });
    }

    const studentsWithScore = profilesData.map(s => {
      const pokemonCount = pokemonCounts.get(s.user_id) || 0;
      const coins = s.coins || 0;
      // Define how totalScore is calculated.
      // Example: 1 Pokémon = 1 point, 10 coins = 1 point
      const totalScore = pokemonCount + Math.floor(coins / 10);
      return {
        id: s.user_id,
        name: s.display_name || s.username, // Use 'name' for display
        username: s.username,
        displayName: s.display_name || s.username, // Keep if external systems rely on this specific prop
        teacherId: s.teacher_id || '',
        schoolId: s.school_id || '',
        createdAt: new Date().toISOString(), // This might be better fetched from DB if actual creation date is needed
        classId: s.class_id,
        avatar: s.profile_photo || undefined,
        pokemonCount: pokemonCount,
        coins: coins,
        totalScore,
        rank: 0 // Placeholder, will be assigned after sorting
      };
    });

    const sortedStudents = studentsWithScore.sort((a, b) => b.totalScore - a.totalScore);
    const rankedStudents = sortedStudents.map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return limitResults ? rankedStudents.slice(0, limitResults) : rankedStudents;
  }, []);

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

  const loadSchoolClasses = useCallback(async (schoolId: string) => {
    setError(null); // Clear any previous errors specific to classes/students
    try {
      const { data: schoolClasses, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId);

      if (classesError) throw classesError;

      if (!schoolClasses || schoolClasses.length === 0) {
        setClasses([]);
        setClassStudents({});
        return;
      }

      setClasses(schoolClasses);

      // Fetch students for each class concurrently
      const classStudentsPromises = schoolClasses.map(async (cls) => {
        const students = await fetchStudentProfilesAndPokemonCounts(
          supabase.from('students').select('id, user_id, display_name, username, teacher_id, class_id, profile_photo, coins').eq('class_id', cls.id),
          10 // Limit to top 10 per class
        );
        return { classId: cls.id, students };
      });

      const results = await Promise.allSettled(classStudentsPromises);
      const newClassStudentsMap: { [key: string]: StudentWithRank[] } = {};
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          newClassStudentsMap[result.value.classId] = result.value.students;
        } else {
          console.error("Failed to load students for a class:", result.reason);
        }
      });
      setClassStudents(newClassStudentsMap);

      // For students, auto-select their class tab if userClassId matches an available class
      if (userType === "student" && userClassId && schoolClasses.some(c => c.id === userClassId)) {
        setCurrentTab('class');
      }

    } catch (err: any) {
      console.error("Error loading classes or class students:", err.message);
      setError(`Failed to load class data: ${err.message}`);
    }
  }, [fetchStudentProfilesAndPokemonCounts, userType, userClassId]);

  const loadSchoolStudents = useCallback(async (schoolId: string) => {
    setError(null); // Clear errors
    try {
      const students = await fetchStudentProfilesAndPokemonCounts(
        supabase.from('students').select('id, user_id, display_name, username, teacher_id, class_id, school_id, profile_photo, coins').eq('school_id', schoolId),
        20 // Limit to top 20 for school ranking
      );
      setSchoolStudents(students);
    } catch (err: any) {
      console.error("Error loading school students:", err.message);
      setError(`Failed to load school students: ${err.message}`);
      setSchoolStudents([]);
    }
  }, [fetchStudentProfilesAndPokemonCounts]);

  const handleStudentClick = useCallback(async (student: StudentWithRank) => {
    setSelectedStudent(student);
    setStudentPokemons([]); // Clear previous pokemons
    setError(null); // Clear previous errors
    try {
      const { data, error: pokemonError } = await supabase
        .from('pokemon_collections')
        .select('*, pokemon_catalog!inner(*)')
        .eq('student_id', student.id);

      if (pokemonError) throw pokemonError;

      const pokemons: Pokemon[] = (data || []).map((item: any) => ({
        id: item.pokemon_catalog.id,
        name: item.pokemon_catalog.name,
        image_url: item.pokemon_catalog.image || '',
        type_1: item.pokemon_catalog.type || 'normal',
        type_2: item.pokemon_catalog.type_2 || undefined, // Include type_2 if available
        rarity: item.pokemon_catalog.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        price: item.pokemon_catalog.price || 0, // Ensure price is number
        description: item.pokemon_catalog.description || undefined,
        power_stats: item.pokemon_catalog.power_stats || undefined // Ensure power_stats is defined
      }));

      setStudentPokemons(pokemons);
    } catch (err: any) {
      console.error("Error loading student pokemon:", err.message);
      setError(`Failed to load Pokémon collection: ${err.message}`);
      setStudentPokemons([]);
    }
  }, []);

  // --- Effects ---

  // Initial load or auto-selection for student
  useEffect(() => {
    const autoSelectStudentSchool = async () => {
      setLoading(true);
      setError(null);
      try {
        let schoolIdToFetch = userSchoolId;

        if (!schoolIdToFetch && userId && userType === "student") {
          const { data: studentData, error: studentError } = await supabase
            .from('students') // Assuming 'students' table has school_id
            .select('school_id')
            .eq('id', userId)
            .single();
          if (studentError) throw studentError;
          if (studentData?.school_id) {
            schoolIdToFetch = studentData.school_id;
          }
        }

        if (schoolIdToFetch) {
          const school = await fetchSchoolData(schoolIdToFetch);
          if (school) {
            setSelectedSchool(school);
          } else {
            setError("Could not find your school details.");
          }
        } else {
          // If no schoolId found, default to loading all schools for selection
          loadAllSchools();
        }
      } catch (err: any) {
        console.error("Error during auto-selection or initial load:", err.message);
        setError(`Initialization error: ${err.message}`);
        loadAllSchools(); // Fallback to showing all schools if auto-select fails
      } finally {
        setLoading(false);
      }
    };

    if (userType === "student" && userSchoolId) {
      autoSelectStudentSchool();
    } else if (userType === "teacher") {
      // Teachers always see all schools initially
      loadAllSchools();
    } else {
        // Handle other user types or no user logged in scenario
        setLoading(false);
        setError("User type not recognized or not logged in.");
    }
  }, [userType, userId, userSchoolId, fetchSchoolData, loadAllSchools]);

  // Load classes and students when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      loadSchoolStudents(selectedSchool.id); // Load students for the school ranking
      loadSchoolClasses(selectedSchool.id); // Load classes and their students
    }
  }, [selectedSchool, loadSchoolStudents, loadSchoolClasses]);


  // --- Helper Functions for Rendering ---

  const getRankingColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black"; // Added text-black for contrast
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-amber-700 text-white";
    return "bg-gray-200 text-gray-700"; // Default, lighter background with darker text
  };

  const renderStudentList = useCallback((studentList: StudentWithRank[], title: string, showClassName = false) => {
    if (!studentList || studentList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Users className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">{t("no-students-found")}</p>
          <p className="mt-2 text-sm">{t("try-another-class-or-school")}</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {title && <h3 className="text-lg font-semibold mb-3 px-2 py-1 bg-gray-50 rounded-md">{title}</h3>}
        {studentList.map(student => {
          const studentClass = showClassName ? classes.find(c => c.id === student.classId) : null;
          return (
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
                  <AvatarImage src={student.avatar || `https://avatar.vercel.sh/${student.username}.png`} alt={`${student.name}'s avatar`} />
                  <AvatarFallback delayMs={600}>
                    {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening student's pokemon list
                      handleStudentProfileClick(student.id);
                    }}
                    className="font-semibold text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {student.displayName}
                  </button>
                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                  {showClassName && studentClass && (
                    <Badge variant="secondary" className="mt-1 font-normal text-xs flex items-center w-fit">
                      <Users className="h-3 w-3 mr-1" />
                      {studentClass.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-xl text-primary">{student.totalScore} {t("points")}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                        <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                        {student.pokemonCount} {t("pokemon")}
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
          );
        })}
      </div>
    );
  }, [classes, handleStudentClick, handleStudentProfileClick, getRankingColor, t]);

  // --- Main Render ---

  // Special rendering for students (if student, directly show their school ranking)
  if (userType === "student" && selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <NavBar userType={userType} userName={localStorage.getItem("studentName") || "Student"} />

        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={handleBackClick} className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {selectedSchool.name} - {t("rankings")}
            </h1>
          </div>

          <SchoolRankingTab schoolId={selectedSchool.id} /> {/* This component already handles its own loading/error */}
        </div>
      </div>
    );
  }

  // General rendering for teachers or initial school selection for students (if auto-select failed)
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
            <Button onClick={() => userType === "teacher" ? loadAllSchools() : window.location.reload()} className="mt-4">
                {t("retry")}
            </Button>
          </div>
        ) : !selectedSchool ? ( // Display list of schools if no school is selected
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
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{t("code")}:</span>
                      <Badge variant="secondary" className="font-mono text-base">{school.code}</Badge>
                    </div>
                    {school.location && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{t("location")}:</span>
                        <span className="font-medium">{school.location}</span>
                      </div>
                    )}
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
        ) : ( // Display school/class rankings once a school is selected
          <Card className="shadow-lg">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{t("top-students")}</CardTitle>
                <Tabs value={currentTab} onValueChange={value => setCurrentTab(value as 'school' | 'class')} className="mt-2">
                  <TabsList>
                    <TabsTrigger value="school" className="flex items-center gap-2 text-base px-4 py-2">
                      <School className="h-4 w-4" />
                      {t("school")}
                    </TabsTrigger>
                    <TabsTrigger value="class" className="flex items-center gap-2 text-base px-4 py-2">
                      <Users className="h-4 w-4" />
                      {t("class")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={currentTab}>
                <TabsContent value="school" className="mt-0">
                  {/* Using the standalone SchoolRankingTab for consistency and reusability */}
                  {/* It handles its own loading and empty states */}
                  <SchoolRankingTab schoolId={selectedSchool.id} />
                </TabsContent>

                <TabsContent value="class" className="mt-0">
                  {classes.length > 0 ? (
                    <div className="space-y-8">
                      {classes.map(cls => (
                        <div key={cls.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                          <h3 className="font-extrabold text-xl mb-4 px-2 py-1 bg-gradient-to-r from-blue-100 to-transparent dark:from-blue-900 rounded-md text-blue-700 dark:text-blue-300">
                            {cls.name}
                          </h3>
                          {renderStudentList(classStudents[cls.id] || [], "")} {/* No title needed here as class name is the title */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="mx-auto h-12 w-12 mb-4" />
                      <p className="text-xl font-semibold">{t("no-classes-found")}</p>
                      <p className="mt-2 text-sm">{t("no-classes-description")}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Pokemon Collection Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"> {/* Increased max-width and added scroll */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedStudent?.displayName}'s {t("pokemon-collection")} ({studentPokemons.length})
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedStudent && studentPokemons.length > 0 ? (
              <PokemonList pokemons={studentPokemons} onPokemonClick={pokemon => setSelectedPokemon(pokemon)} />
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <img src="/path/to/empty-pokeball.png" alt="No Pokémon" className="mx-auto w-24 h-24 mb-4 opacity-75" />
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
