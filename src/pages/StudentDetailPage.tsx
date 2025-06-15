
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StudentProfileBasicInfo from "@/components/student-profile/StudentProfileBasicInfo";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";
import StudentProfileCoins from "@/components/student-profile/StudentProfileCoins";
import StudentProfileAchievements from "@/components/student-profile/StudentProfileAchievements";
import SchoolClassInfo from "@/components/student/profile/SchoolClassInfo";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import { School, Users } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";

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
  const found = students.find((s: any) => s.id === studentId);
  if (!found) {
    console.warn("[StudentDetailPage] Student ID not found in localStorage:", studentId);
  }
  return found || null;
};

const getSchool = (schoolId: string) => {
  if (!schoolId) {
    console.warn("[StudentDetailPage] No schoolId provided");
    return null;
  }
  const schools = JSON.parse(localStorage.getItem("schools") || "[]");
  const result = schools.find((s: any) => s.id === schoolId);
  if (!result) {
    console.warn("[StudentDetailPage] School not found with schoolId:", schoolId, "Available schools:", schools.map((s:any) => ({id: s.id, name: s.name})));
  }
  return result || null;
};

const getClasses = (studentId: string) => {
  // First try: Look in studentClasses table
  let classAssignments = JSON.parse(localStorage.getItem("studentClasses") || "[]");
  let assignedClassIds = classAssignments
    .filter((ca: any) => ca.studentId === studentId)
    .map((ca: any) => ca.classId);
  
  let allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
  let filtered = allClasses.filter((c: any) => assignedClassIds.includes(c.id));

  // Second try: Look in classes.students array
  if (filtered.length === 0) {
    filtered = allClasses.filter((c: any) => 
      c.students && Array.isArray(c.students) && c.students.includes(studentId)
    );
  }

  // Third try: Check student.classId or student.class_id
  if (filtered.length === 0) {
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const stu = students.find((s: any) => s.id === studentId);
    let studentClassIds: string[] = [];
    
    if (stu?.classId || stu?.class_id) {
      const idsString = stu.classId || stu.class_id;
      if (typeof idsString === "string") {
        studentClassIds = idsString.split(",").map((id) => id.trim()).filter(Boolean);
      } else if (Array.isArray(idsString)) {
        studentClassIds = idsString;
      }
    }
    
    if (studentClassIds.length > 0) {
      filtered = allClasses.filter((c: any) => studentClassIds.includes(c.id));
    }
  }

  console.log("[StudentDetailPage] Found classes for student:", studentId, filtered);
  return filtered;
};

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  const sid = studentId || id;
  const navigate = useNavigate();
  const loggedInUserType = localStorage.getItem("userType") || "student";

  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [coins, setCoins] = useState(0);
  const [homeworkStreak, setHomeworkStreak] = useState(0);
  const [isStarOfClass, setIsStarOfClass] = useState(false);

  useEffect(() => {
    if (!sid) return;

    const loadStudentData = async () => {
      // 1. Fetch student data with school info
      const { data: studentWithSchool, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          school:school_id (id, name)
        `)
        .eq('id', sid)
        .maybeSingle();

      if (studentError) console.error("Error fetching student:", studentError.message);
      
      let stu = studentWithSchool;
      // Fallback to localStorage if Supabase fails
      if (!stu) {
        console.warn(`Student with id ${sid} not found in Supabase, falling back to localStorage.`);
        stu = getStudent(sid);
      }

      if (!stu) {
        setStudent(null);
        return;
      }
      setStudent(stu);

      // 2. Set School data
      const schoolData = stu.school || getSchool(stu.school_id || stu.schoolId);
      setSchool(schoolData);
      console.log("[StudentDetailPage] School data:", schoolData);

      // 3. Fetch Classes
      let classesData: any[] = [];
      const { data: classAssignments } = await supabase
        .from('student_classes')
        .select('class_id')
        .eq('student_id', sid);

      let classIds = classAssignments ? classAssignments.map(c => c.class_id) : [];

      if (classIds.length === 0 && (stu.class_id || stu.classId)) {
        const ids = stu.class_id || stu.classId;
        classIds = Array.isArray(ids) ? ids : String(ids).split(',').map(id => id.trim()).filter(Boolean);
      }

      if (classIds.length > 0) {
        const { data: fetchedClasses } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);
        if (fetchedClasses) classesData = fetchedClasses;
      }

      // Fallback for classes
      if (classesData.length === 0) {
        console.warn(`Classes for student ${sid} not found in Supabase, falling back to localStorage.`);
        classesData = getClasses(sid);
      }
      setClasses(classesData);
      
      // 4. Set other info from localStorage
      setPokemons(getPokemons(stu.id));
      setCoins(getCoinBalance(stu.id));
      setHomeworkStreak(getHomeworkStreak(stu.id));
      setIsStarOfClass(getStarOfClass(stu.id, classesData));
    };

    loadStudentData();
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
          <CardContent>
            {/* Student profile basic info, avatar, name */}
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
      </div>
    </>
  );
};

export default StudentDetailPage;
