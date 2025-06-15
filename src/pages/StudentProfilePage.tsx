
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StudentProfileBasicInfo from "@/components/student-profile/StudentProfileBasicInfo";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";
import StudentProfileCoins from "@/components/student-profile/StudentProfileCoins";
import StudentProfileAchievements from "@/components/student-profile/StudentProfileAchievements";
import SchoolClassInfo from "@/components/student/profile/SchoolClassInfo";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

// Helper functions for fetching data from localStorage as a fallback
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
  const streaks = JSON.parse(localStorage.getItem("homeworkStreaks") || "{}");
  return streaks[studentId] || 0;
};

const getStarOfClass = (studentId: string, classes: any[]): boolean => {
  const classStars = JSON.parse(localStorage.getItem("starOfClassByClassId") || "{}");
  return classes.some((cls) => classStars[cls.id] === studentId);
};

const getStudent = (studentId: string) => {
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  return students.find((s: any) => s.id === studentId) || null;
};

const getSchool = (schoolId: string) => {
  if (!schoolId) return null;
  const schools = JSON.parse(localStorage.getItem("schools") || "[]");
  return schools.find((s: any) => s.id === schoolId) || null;
};

const getClasses = (studentId: string) => {
  let classAssignments = JSON.parse(localStorage.getItem("studentClasses") || "[]");
  let assignedClassIds = classAssignments
    .filter((ca: any) => ca.studentId === studentId)
    .map((ca: any) => ca.classId);
  
  let allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
  let filtered = allClasses.filter((c: any) => assignedClassIds.includes(c.id));

  if (filtered.length === 0) {
    filtered = allClasses.filter((c: any) => c.students?.includes(studentId));
  }
  return filtered;
};

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
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [coins, setCoins] = useState(0);
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
      const { data: studentWithSchool, error: studentError } = await supabase
        .from('students')
        .select(`*, school:school_id (id, name)`)
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) console.error("Error fetching student:", studentError.message);
      
      let stu = studentWithSchool;
      if (!stu) {
        console.warn(`Student with id ${studentId} not found in Supabase, falling back to localStorage.`);
        stu = getStudent(studentId);
      }

      if (!stu) {
        setStudent(null);
        return;
      }
      setStudent(stu);

      const schoolData = stu.school || getSchool(stu.school_id || stu.schoolId);
      setSchool(schoolData);

      let classesData: any[] = [];
      const { data: classAssignments } = await supabase.from('student_classes').select('class_id').eq('student_id', studentId);
      let classIds = classAssignments ? classAssignments.map(c => c.class_id) : [];

      if (classIds.length === 0 && (stu.class_id || stu.classId)) {
        const ids = stu.class_id || stu.classId;
        classIds = Array.isArray(ids) ? ids : String(ids).split(',').map(id => id.trim()).filter(Boolean);
      }

      if (classIds.length > 0) {
        const { data: fetchedClasses } = await supabase.from('classes').select('*').in('id', classIds);
        if (fetchedClasses) classesData = fetchedClasses;
      }

      if (classesData.length === 0) {
        classesData = getClasses(studentId);
      }
      setClasses(classesData);
      
      setPokemons(getPokemons(stu.id));
      setCoins(getCoinBalance(stu.id));
      setHomeworkStreak(getHomeworkStreak(stu.id));
      setIsStarOfClass(getStarOfClass(stu.id, classesData));
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
              avatar={student.avatar}
              school={school ? { id: school.id, name: school.name } : undefined}
              classes={classes.map((c: any) => ({ id: c.id, name: c.name }))}
              isStarOfClass={isStarOfClass}
              userType={loggedInUserType as 'student' | 'teacher'}
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
    </div>
  );
};

export default StudentProfilePage;
