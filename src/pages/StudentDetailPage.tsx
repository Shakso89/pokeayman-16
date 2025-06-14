
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StudentProfileBasicInfo from "@/components/student-profile/StudentProfileBasicInfo";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";
import StudentProfileCoins from "@/components/student-profile/StudentProfileCoins";
import StudentProfileAchievements from "@/components/student-profile/StudentProfileAchievements";
import StudentProfileSchoolClasses from "@/components/student-profile/StudentProfileSchoolClasses";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import { School, Users } from "lucide-react";

const getPokemons = (studentId: string) => {
  const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
  const collection = studentPokemons.find((sp: any) => sp.studentId === studentId);
  return collection?.pokemons || [];
};
const getCoinBalance = (studentId: string): number => {
  const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
  const collection = studentPokemons.find((sp: any) => sp.studentId === studentId);
  return collection?.coins ?? 0;
};
const getHomeworkStreak = (studentId: string): number => {
  // Implemented as demo -- in production should be server/API call
  const streaks = JSON.parse(localStorage.getItem("homeworkStreaks") || "{}");
  return streaks[studentId] || 0;
};
const getStarOfClass = (studentId: string, classes: any[]): boolean => {
  // Demo logic: Check 'starOfClass' stored in localStorage by class
  const classStars = JSON.parse(localStorage.getItem("starOfClassByClassId") || "{}");
  return classes.some((cls) => classStars[cls.id] === studentId);
};
const getStudent = (studentId: string) => {
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  return students.find((s: any) => s.id === studentId) || null;
};
const getSchool = (schoolId: string) => {
  const schools = JSON.parse(localStorage.getItem("schools") || "[]");
  return schools.find((s: any) => s.id === schoolId) || null;
};
const getClasses = (studentId: string, schoolId: string) => {
  // Classes assignment for demo purposes; in reality, join to student_classes
  const classAssignments = JSON.parse(localStorage.getItem("studentClasses") || "[]");
  const assignedClasses = classAssignments
    .filter((ca: any) => ca.studentId === studentId)
    .map((ca: any) => ca.classId);
  const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
  return allClasses.filter((c: any) => assignedClasses.includes(c.id) && c.schoolId === schoolId);
};

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  const sid = studentId || id;
  const navigate = useNavigate();

  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [coins, setCoins] = useState(0);
  const [homeworkStreak, setHomeworkStreak] = useState(0);
  const [isStarOfClass, setIsStarOfClass] = useState(false);

  useEffect(() => {
    if (!sid) return;
    const stu = getStudent(sid);
    if (!stu) {
      setStudent(null);
      return;
    }
    setStudent(stu);
    const sch = getSchool(stu.schoolId || stu.school_id);
    setSchool(sch);

    const cls = getClasses(stu.id, sch?.id);
    setClasses(cls);

    setPokemons(getPokemons(stu.id));
    setCoins(getCoinBalance(stu.id));
    setHomeworkStreak(getHomeworkStreak(stu.id));
    setIsStarOfClass(getStarOfClass(stu.id, cls));
  }, [sid]);

  function handleBack() {
    if (classes && classes.length > 0) {
      navigate(`/class/${classes[0].id}`);
    } else {
      navigate(-1);
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

  // Improved Get display name (prefer real name, then username, but avoid showing id-like values)
  function getNiceDisplayName(student: any): string {
    const candidates = [
      student?.displayName,
      student?.display_name,
      student?.username,
    ].filter(Boolean);
    for (const name of candidates) {
      if (
        typeof name === "string" &&
        name.trim() &&
        // Prevent showing number-only values or id-like values (UUID or large numbers)
        !/^\d{6,}$/.test(name.trim()) &&
        !/^[a-f0-9-]{20,}$/.test(name.trim())
      ) {
        return name.trim();
      }
    }
    return "Unnamed Student";
  }
  const displayName = getNiceDisplayName(student);

  return (
    <div className="container max-w-3xl py-8 mx-auto">
      {/* Profile header with custom back handler */}
      <ProfileHeader title="Student Profile" onBack={handleBack} />

      <Card>
        <CardContent>
          {/* Student profile basic info, avatar, name */}
          <StudentProfileBasicInfo
            displayName={displayName}
            avatar={student.avatar}
            school={school ? { id: school.id, name: school.name } : undefined}
            classes={classes.map((c: any) => ({ id: c.id, name: c.name }))}
            isStarOfClass={isStarOfClass}
          />

          <StudentProfileCoins coins={coins} />

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

          {/* Bottom: School & Classes info with better formatting */}
          <div className="mt-6 border-t pt-6">
            <h3 className="font-bold text-lg mb-2">School & Classes</h3>
            {school ? (
              <div className="mb-3 flex items-center gap-2 text-blue-700 font-medium">
                <School className="h-5 w-5" />
                {school.name}
              </div>
            ) : (
              <div className="mb-3 text-gray-500">No school assigned</div>
            )}
            {classes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200 flex items-center gap-2"
                    onClick={() => navigate(`/class/${c.id}`)}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{c.name}</span>
                    {c.description && (
                      <span className="text-xs text-gray-500 ml-2">{c.description}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Not assigned to any classes</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailPage;
