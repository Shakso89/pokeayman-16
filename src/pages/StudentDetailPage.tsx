import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StudentProfileBasicInfo from "@/components/student-profile/StudentProfileBasicInfo";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";
import CoinsDisplay from "@/components/student/profile/CoinsDisplay";
import StudentProfileAchievements from "@/components/student-profile/StudentProfileAchievements";
import SchoolClassInfo from "@/components/student/profile/SchoolClassInfo";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { getStudentProfileById } from "@/services/studentDatabase";
import { Pokemon } from "@/types/pokemon";
import ActivityFeed from "@/components/feed/ActivityFeed";

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  const sid = studentId || id;
  const navigate = useNavigate();
  const loggedInUserType = localStorage.getItem("userType") || "student";

  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);
  const [homeworkStreak, setHomeworkStreak] = useState(0);
  const [isStarOfClass, setIsStarOfClass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const loadStudentData = async () => {
      // Fetch student data first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`*, school:school_id (id, name)`)
        .eq('id', sid)
        .maybeSingle();

      if (studentError) console.error("Error fetching student:", studentError.message);
      
      if (!studentData) {
        setLoading(false);
        setStudent(null);
        return;
      }
      setStudent(studentData);
      setSchool(studentData.school);
      
      const [profile, pokemonCollection] = await Promise.all([
        getStudentProfileById(sid),
        supabase.from('pokemon_collections').select('*').eq('student_id', sid)
      ]);
      
      if (profile) {
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
      const { data: classAssignments } = await supabase.from('student_classes').select('class_id').eq('student_id', sid);
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
  }, [sid]);

  function handleBack() {
    if (classes && classes.length > 0) {
      const classId = classes[0].id;
      if (loggedInUserType === 'teacher') {
        navigate(`/class-details/${classId}`);
      } else {
        navigate(`/student/class/${classId}`);
      }
    } else {
      if (loggedInUserType === "student") {
        navigate("/student-dashboard");
      } else if (loggedInUserType === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/");
      }
    }
  }

  if (!sid) return <Navigate to="/" />;

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl p-6">
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <p className="text-2xl font-bold text-gray-700">Student not found.</p>
              <button className="text-blue-600 underline mt-2" onClick={() => navigate(-1)}>
                Go back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get a human-friendly display name for the student
  function getNiceDisplayName(student: any): string {
    // Prioritize display_name and displayName over username
    const candidates = [
      student?.display_name,
      student?.displayName,
      student?.username,
    ].filter(Boolean);
    
    for (const name of candidates) {
      if (
        typeof name === "string" &&
        name.trim().length > 1 &&
        !/^\d+$/g.test(name.trim()) &&
        !/^[a-f0-9\-]{20,}$/.test(name.trim())
      ) {
        return name.trim();
      }
    }
    return "Unnamed Student";
  }
  
  const displayName = getNiceDisplayName(student);

  // For header (prefer displayName, else username)
  const username = student?.username || student?.displayName || "Student";
  const userAvatar = student?.avatar;

  return (
    <>
      <AppHeader userType="student" userName={username} userAvatar={userAvatar} />
      <div className="container max-w-3xl py-8 mx-auto">
        {/* Keep old ProfileHeader for now (you may want to visually replace/remove it later) */}
        <ProfileHeader title="Student Profile" onBack={handleBack} />

        <Card>
          <CardContent className="pt-6">
            {/* Student profile basic info, avatar, name */}
            <StudentProfileBasicInfo
              displayName={displayName}
              avatar={student.avatar}
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

            {/* School & Classes section at the bottom */}
            <div className="mt-6 border-t pt-6" data-debug="school-and-classes">
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
          <ActivityFeed userId={sid} title="Recent Activity" />
        </div>
      </div>
    </>
  );
};

export default StudentDetailPage;
