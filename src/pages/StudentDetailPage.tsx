
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

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  
  // Fix the student ID resolution
  const resolvedStudentId = studentId || id;
  console.log("StudentDetailPage - Route params:", { id, studentId, resolvedStudentId });
  
  const navigate = useNavigate();
  const loggedInUserType = localStorage.getItem("userType") || "student";

  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [homeworkStreak, setHomeworkStreak] = useState(0);
  const [isStarOfClass, setIsStarOfClass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("StudentDetailPage - Effect triggered with resolvedStudentId:", resolvedStudentId);
    
    if (!resolvedStudentId || resolvedStudentId === 'undefined') {
      console.error("StudentDetailPage - Invalid student ID:", resolvedStudentId);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const loadStudentData = async () => {
      try {
        console.log("StudentDetailPage - Loading student data for ID:", resolvedStudentId);
        
        // Fetch student data first
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`*, school:school_id (id, name)`)
          .eq('id', resolvedStudentId)
          .maybeSingle();

        if (studentError) {
          console.error("Error fetching student:", studentError.message);
        }
        
        if (!studentData) {
          console.log("StudentDetailPage - No student found in students table, checking student_profiles");
          
          // Try student_profiles table as fallback
          const { data: profileData, error: profileError } = await supabase
            .from('student_profiles')
            .select(`*, school:school_id (id, name)`)
            .eq('user_id', resolvedStudentId)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error fetching student profile:", profileError.message);
          }
          
          if (!profileData) {
            console.log("StudentDetailPage - Student not found in either table");
            setLoading(false);
            setStudent(null);
            return;
          }
          
          // Use profile data
          setStudent(profileData);
          setSchool(profileData.school);
        } else {
          // Use students table data
          setStudent(studentData);
          setSchool(studentData.school);
        }
        
        // Get student profile for additional data
        const profile = await getStudentProfileById(resolvedStudentId);
        
        if (profile) {
          // Fetch Pokemon collection
          const { data: pokemonCollection } = await supabase
            .from('pokemon_collections')
            .select('*, pokemon_catalog!inner(*)')
            .eq('student_id', profile.id);

          if (pokemonCollection) {
            const formattedPokemons: Pokemon[] = pokemonCollection.map((item: any) => ({
              id: item.pokemon_catalog.id,
              name: item.pokemon_catalog.name,
              image: item.pokemon_catalog.image,
              type: item.pokemon_catalog.type,
              rarity: item.pokemon_catalog.rarity,
              powerStats: item.pokemon_catalog.power_stats
            }));
            setPokemons(formattedPokemons);
          }

          // Get achievements and homework streak
          const [achievements, streak] = await Promise.all([
            supabase.from('achievements').select('*').eq('student_id', profile.id).eq('type', 'star_of_class').eq('is_active', true),
            supabase.rpc('calculate_homework_streak', { p_student_id: profile.id })
          ]);
          
          if (achievements.data && achievements.data.length > 0) {
            setIsStarOfClass(true);
          }
          
          if (streak.data) {
            setHomeworkStreak(streak.data);
          }
        }

        // Fetch classes - try student_classes join table first
        const { data: classAssignments } = await supabase
          .from('student_classes')
          .select('class_id')
          .eq('student_id', resolvedStudentId);
          
        let classIds: string[] = [];
        if (classAssignments && classAssignments.length > 0) {
          classIds = classAssignments.map(c => c.class_id);
        } else if (student?.class_id) {
          // Fallback to class_id field
          const studentClassId = student.class_id;
          classIds = Array.isArray(studentClassId) 
            ? studentClassId 
            : String(studentClassId).split(',').map((id: string) => id.trim()).filter(Boolean);
        }

        if (classIds.length > 0) {
          const { data: fetchedClasses } = await supabase
            .from('classes')
            .select('*')
            .in('id', classIds);
          if (fetchedClasses) setClasses(fetchedClasses);
        }
        
      } catch (error) {
        console.error("Error loading student data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [resolvedStudentId]);

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

  if (!resolvedStudentId || resolvedStudentId === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl p-6">
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <p className="text-2xl font-bold text-gray-700">Invalid student ID</p>
              <button className="text-blue-600 underline mt-2" onClick={() => navigate(-1)}>
                Go back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-xl p-6">
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg">Loading student profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <ProfileHeader title="Student Profile" onBack={handleBack} />

        <Card>
          <CardContent className="pt-6">
            <StudentProfileBasicInfo
              displayName={displayName}
              avatar={student.avatar}
              school={school ? { id: school.id, name: school.name } : undefined}
              classes={classes.map((c: any) => ({ id: c.id, name: c.name }))}
              isStarOfClass={isStarOfClass}
              userType={loggedInUserType as 'student' | 'teacher'}
            />

            <div className="mt-6">
              <CoinsDisplay studentId={resolvedStudentId} />
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
      </div>
    </>
  );
};

export default StudentDetailPage;
