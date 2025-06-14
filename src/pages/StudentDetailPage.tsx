
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft, MessageSquare, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";
import { useStudentData } from "@/hooks/useStudentData";
import { 
  getStudentProfileById, 
  getStudentAchievements, 
  calculateHomeworkStreak,
  getStudentClasses,
  awardStarOfClass,
  Achievement,
  StudentClass
} from "@/services/studentDatabase";
import AchievementsDisplay from "@/components/student/achievements/AchievementsDisplay";
import SchoolClassInfo from "@/components/student/profile/SchoolClassInfo";

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  classId?: string;
  schoolId?: string;
}

interface School {
  id: string;
  name: string;
}

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string, studentId?: string }>();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [homeworkStreak, setHomeworkStreak] = useState<number>(0);
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<StudentData>>({});

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const userName = userType === "teacher" ?
    localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") :
    localStorage.getItem("studentName");
  
  // Use the ID from either parameter
  const actualStudentId = studentId || id;
  
  // Check if current user is the owner of this profile
  const isOwnProfile = userType === "student" && localStorage.getItem("studentId") === actualStudentId;
  const isTeacherView = userType === "teacher";

  // Use the student data hook
  const { profile, pokemons, coins, spentCoins, isLoading: dataLoading, refreshData } = useStudentData(actualStudentId || '');

  useEffect(() => {
    if (actualStudentId) {
      loadStudentData(actualStudentId);
      loadAchievements(actualStudentId);
      loadHomeworkStreak(actualStudentId);
      loadStudentClasses(actualStudentId);
    }
  }, [actualStudentId]);

  useEffect(() => {
    if (profile) {
      setStudent({
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name || profile.username,
        teacherId: profile.teacher_id || '',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        avatar: profile.avatar_url,
        classId: profile.class_id,
        schoolId: profile.school_id
      });
      setEditData({
        displayName: profile.display_name || profile.username,
        avatar: profile.avatar_url
      });

      // Load school information if we have school_id
      if (profile.school_id) {
        loadSchoolInfo(profile.school_id);
      }
    }
  }, [profile]);
  
  const loadStudentData = async (id: string) => {
    try {
      const studentProfile = await getStudentProfileById(id);
      if (studentProfile) {
        setStudent({
          id: studentProfile.id,
          username: studentProfile.username,
          displayName: studentProfile.display_name || studentProfile.username,
          teacherId: studentProfile.teacher_id || '',
          createdAt: studentProfile.created_at,
          updatedAt: studentProfile.updated_at,
          avatar: studentProfile.avatar_url,
          classId: studentProfile.class_id,
          schoolId: studentProfile.school_id
        });
        setEditData({
          displayName: studentProfile.display_name || studentProfile.username,
          avatar: studentProfile.avatar_url
        });
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      toast.error(t("error-loading-student"));
    }
  };

  const loadAchievements = async (studentId: string) => {
    try {
      const studentAchievements = await getStudentAchievements(studentId);
      setAchievements(studentAchievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  };

  const loadHomeworkStreak = async (studentId: string) => {
    try {
      const streak = await calculateHomeworkStreak(studentId);
      setHomeworkStreak(streak);
    } catch (error) {
      console.error("Error loading homework streak:", error);
    }
  };

  const loadStudentClasses = async (studentId: string) => {
    try {
      const classes = await getStudentClasses(studentId);
      setStudentClasses(classes);
    } catch (error) {
      console.error("Error loading student classes:", error);
    }
  };

  const loadSchoolInfo = async (schoolId: string) => {
    try {
      // For now, we'll use a placeholder. In a real app, you'd fetch from schools table
      setSchool({
        id: schoolId,
        name: "Default School" // This should be fetched from the schools table
      });
    } catch (error) {
      console.error("Error loading school info:", error);
    }
  };

  const handleAwardStar = async () => {
    if (!student || !currentUserId) return;
    
    // For now, we'll assume the student is in one class. In a real app, you'd select which class
    const classId = student.classId || (studentClasses[0]?.class_id);
    if (!classId) {
      toast.error("Student must be assigned to a class to receive star award");
      return;
    }

    try {
      const success = await awardStarOfClass(student.id, classId, currentUserId);
      if (success) {
        toast.success("Star of Class awarded! Student received 50 coins.");
        loadAchievements(student.id);
        refreshData();
      } else {
        toast.error("Failed to award Star of Class");
      }
    } catch (error) {
      console.error("Error awarding star:", error);
      toast.error("Failed to award Star of Class");
    }
  };

  const handleSendMessage = () => {
    if (!student) return;
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
  };

  const hasStarOfClass = achievements.some(a => a.type === 'star_of_class' && a.is_active);

  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }
  
  if (dataLoading || !student) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar 
          userType={userType as "teacher" | "student"} 
          userName={userType === "teacher" ? localStorage.getItem("teacherDisplayName") || "Teacher" : localStorage.getItem("studentName") || ""}
        />
        <div className="container mx-auto py-8 px-4 text-center">
          <p>{dataLoading ? t("loading") : t("student-not-found")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"}
        userName={userType === "teacher" ? 
          localStorage.getItem("teacherDisplayName") || "Teacher" : 
          localStorage.getItem("studentName") || ""}
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {t("student-profile")}
              {hasStarOfClass && <Star className="h-6 w-6 text-yellow-500 fill-current" />}
            </h1>
          </div>

          {/* Teacher Actions */}
          {isTeacherView && (
            <div className="flex gap-2">
              <Button onClick={handleSendMessage} variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button onClick={handleAwardStar} className="bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-4 w-4 mr-2" />
                Award Star
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Profile Sidebar */}
          <ProfileSidebar
            student={{
              id: student.id,
              displayName: student.displayName,
              username: student.username,
              avatar: student.avatar
            }}
            isOwner={isOwnProfile}
            isEditing={isEditing}
            friendRequestSent={false}
            onEditClick={() => setIsEditing(true)}
            onSendMessageClick={handleSendMessage}
            onAddFriendClick={() => {}}
            onSaveClick={() => setIsEditing(false)}
            onCancelClick={() => setIsEditing(false)}
          />
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
                <TabsTrigger value="pokemon">{t("pokemon")}</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="school-classes">School & Classes</TabsTrigger>
                {isOwnProfile && <TabsTrigger value="settings">{t("settings")}</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("student-overview")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800">Coins</h3>
                        <p className="text-2xl font-bold text-yellow-600">{coins}</p>
                        <p className="text-sm text-yellow-600">Spent: {spentCoins}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800">Pokémon</h3>
                        <p className="text-2xl font-bold text-purple-600">{pokemons.length}</p>
                        <p className="text-sm text-purple-600">Collected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pokemon">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("pokemon-collection")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pokemons.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No Pokémon collected yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {pokemons.map((pokemon, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                            <img 
                              src={pokemon.image} 
                              alt={pokemon.name}
                              className="w-full h-24 object-contain mb-2"
                            />
                            <h4 className="font-semibold text-center">{pokemon.name}</h4>
                            <p className="text-sm text-gray-500 text-center capitalize">{pokemon.rarity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <AchievementsDisplay 
                  achievements={achievements} 
                  homeworkStreak={homeworkStreak} 
                />
              </TabsContent>

              <TabsContent value="school-classes">
                <SchoolClassInfo
                  school={school || undefined}
                  classes={studentClasses.map(sc => ({
                    id: sc.class_id,
                    name: (sc as any).classes?.name || 'Unknown Class',
                    description: (sc as any).classes?.description
                  }))}
                />
              </TabsContent>
              
              {isOwnProfile && (
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account-settings")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t("display-name")}:</label>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editData.displayName || ""} 
                              onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md mt-1"
                            />
                          ) : (
                            <p>{student.displayName}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t("username")}:</label>
                          <p>{student.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">School:</label>
                          <p>{school?.name || 'Not assigned'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Photo View Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>{t("photo")}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedPhoto} 
                alt="Enlarged" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
