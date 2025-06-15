import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StudentProfileBasicInfo from "@/components/student-profile/StudentProfileBasicInfo";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";
import CoinsDisplay from "@/components/student/profile/CoinsDisplay";
import StudentProfileAchievements from "@/components/student-profile/StudentProfileAchievements";
import SchoolClassInfo from "@/components/student/profile/SchoolClassInfo";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { getStudentProfileById, StudentProfile } from "@/services/studentDatabase";
import { Pokemon } from "@/types/pokemon";
import ActivityFeed from "@/components/feed/ActivityFeed";

const getNiceDisplayName = (student: any): string => {
  const candidates = [student?.display_name, student?.displayName, student?.username].filter(Boolean);
  for (const name of candidates) {
    if (typeof name === "string" && name.trim().length > 1 && !/^\d+$/g.test(name.trim()) && !/^[a-f0-9\-]{20,}$/.test(name.trim())) {
      return name.trim();
    }
  }
  return "Unnamed Student";
};


const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loggedInUserType = localStorage.getItem("userType") || "student";

  const [student, setStudent] = useState<any | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [homeworkStreak, setHomeworkStreak] = useState(0);
  const [isStarOfClass, setIsStarOfClass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const loadStudentData = async () => {
      // Fetch student data first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`*, school:school_id (id, name)`)
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) console.error("Error fetching student:", studentError.message);
      
      if (!studentData) {
        setLoading(false);
        setStudent(null);
        return;
      }
      setStudent(studentData);
      setSchool(studentData.school);
      
      // Fetch profile and pokemons in parallel
      const [profile, pokemonCollection] = await Promise.all([
          getStudentProfileById(studentId),
          supabase.from('pokemon_collections').select('*').eq('student_id', studentId)
      ]);
      
      if (profile) {
        setStudentProfile(profile);
        setCoins(profile.coins);
        setSpentCoins(profile.spent_coins);
      
        // Once we have the profile, use profile.id to fetch related data
        const [achievements, streak] = await Promise.all([
          supabase.from('achievements').select('*').eq('student_id', profile.id).eq('type', 'star_of_class').eq('is_active', true),
          supabase.rpc('calculate_homework_streak', { p_student_id: profile.id })
        ]);
        
        if (achievements.data && achievements.data.length > 0) {
          setIsStarOfClass(true);
        } else {
          setIsStarOfClass(false);
        }
        
        if (streak.data) {
          setHomeworkStreak(streak.data);
        }
      } else {
        // if no profile, reset related states
        setCoins(0);
        setSpentCoins(0);
        setIsStarOfClass(false);
        setHomeworkStreak(0);
      }

      if (pokemonCollection.data) {
        setPokemons(pokemonCollection.data.map((p: any) => ({
          id: p.pokemon_id,
          name: p.pokemon_name,
          image: p.pokemon_image,
          type: p.pokemon_type,
          rarity: p.pokemon_rarity
        } as Pokemon)));
      } else {
        setPokemons([]);
      }

      // Fetch classes from the join table first as the source of truth
      const { data: classAssignments } = await supabase.from('student_classes').select('class_id').eq('student_id', studentId);
      let classIds: string[] = [];
      if (classAssignments && classAssignments.length > 0) {
          classIds = classAssignments.map(c => c.class_id);
      } else if (studentData.class_id) {
          // Fallback to the deprecated class_id field on students table
          const studentClassId = studentData.class_id;
          classIds = Array.isArray(studentClassId) ? studentClassId : String(studentClassId).split(',').map((id: string) => id.trim()).filter(Boolean);
      }

      if (classIds.length > 0) {
        const { data: fetchedClasses } = await supabase.from('classes').select('*').in('id', classIds);
        if (fetchedClasses) setClasses(fetchedClasses);
      }
    };

    loadStudentData().finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Card className="p-8 text-center shadow-xl rounded-lg">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("student-not-found")}</h2>
            <Button onClick={() => navigate(-1)}>{t("go-back")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = getNiceDisplayName(student);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container max-w-3xl py-8 mx-auto">
        <ProfileHeader title={t("student-profile")} onBack={() => navigate(-1)} />

        <Card>
          <CardContent className="pt-6">
            <StudentProfileBasicInfo
              displayName={displayName}
              avatar={studentProfile?.avatar_url}
              school={school ? { id: school.id, name: school.name } : undefined}
              classes={classes.map((c: any) => ({ id: c.id, name: c.name }))}
              isStarOfClass={isStarOfClass}
              userType={loggedInUserType as 'student' | 'teacher'}
            />

            <div className="mt-6">
              <CoinsDisplay coins={coins} spentCoins={spentCoins} />
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg mb-2">Pokémon Collection</h3>
              <StudentProfilePokemonList pokemons={pokemons} />
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg mb-2">Achievements</h3>
              <StudentProfileAchievements 
                homeworkStreak={homeworkStreak}
                isStarOfClass={isStarOfClass}
              />
            </div>
            
            <div className="mt-6 border-t pt-6">
              <SchoolClassInfo
                school={school ? { id: school.id, name: school.name } : undefined}
                classes={classes.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  description: c.description,
                }))}
                userType={loggedInUserType as 'student' | 'teacher'}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ActivityFeed userId={studentId} title="Recent Activity" />
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
