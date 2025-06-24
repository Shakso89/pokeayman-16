
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Edit3,
  Save,
  X,
  Camera,
  Users,
  Trophy,
  School,
  GraduationCap,
  Loader2,
  MessageSquare,
  UserPlus,
  Coins
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import PokemonList from "@/components/student/PokemonList";

const StudentProfilePage: React.FC = () => {
  const { studentId: routeStudentId } = useParams();
  const navigate = useNavigate();
  const localStudentId = localStorage.getItem("studentId");
  const studentId = routeStudentId || localStudentId;
  
  const {
    student,
    isLoading,
    isSaving,
    error,
    isEditing,
    editData,
    isOwner,
    friendRequestSent,
    setEditData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleSendMessage,
    handleAddFriend
  } = useStudentProfile(studentId);

  const [activeTab, setActiveTab] = useState("overview");

  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const userName = userType === "teacher" 
    ? localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") || "Teacher"
    : localStorage.getItem("studentName") || "Student";

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      console.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditData({ ...editData, avatarUrl: e.target.result.toString() });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Student ID</h1>
            <p className="text-gray-600 mb-4">No student ID provided in URL or local storage</p>
            <Button onClick={() => navigate(userType === "teacher" ? "/teacher-dashboard" : "/student-dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading student profile...</span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
            <p className="text-gray-600 mb-4">{error || "Student not found"}</p>
            <div className="space-x-2">
              <Button onClick={handleBackClick}>Go Back</Button>
              <Button 
                onClick={() => navigate(userType === "teacher" ? "/teacher-dashboard" : "/student-dashboard")} 
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userType={userType} userName={userName} />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Student Profile</h1>
          </div>

          <div className="flex gap-2">
            {isOwner && !isEditing && (
              <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
            {isOwner && isEditing && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button onClick={handleSendMessage} variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  onClick={handleAddFriend}
                  disabled={friendRequestSent}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {friendRequestSent ? "Request Sent" : "Add Friend"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={isEditing ? editData.avatarUrl : student.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {student.displayName?.[0]?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                {isOwner && isEditing && (
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                      <Camera className="h-4 w-4" />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <Input
                    value={editData.displayName || ''}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    placeholder="Display Name"
                    className="text-3xl font-bold mb-2 text-center md:text-left"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mb-2">{student.displayName}</h2>
                )}
                
                <p className="text-xl text-gray-600 mb-4">@{student.username}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <Badge className="px-3 py-1 text-base bg-green-100 text-green-800">
                    <Coins className="h-4 w-4 mr-1" />
                    {student.id ? "Loading..." : "0"} Coins
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-blue-100 text-blue-800">
                    <Trophy className="h-4 w-4 mr-1" />
                    {student.pokemonCollection.length} Pokémon
                  </Badge>
                  {student.schoolName && (
                    <Badge className="px-3 py-1 text-base bg-purple-100 text-purple-800">
                      <School className="h-4 w-4 mr-1" />
                      {student.schoolName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <Coins className="h-4 w-4" />
                Total Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {student.id ? "Loading..." : "0"}
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4" />
                Pokémon Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{student.pokemonCollection.length}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Class Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">-</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pokemon">Pokémon Collection</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Display Name</label>
                    <p className="text-lg">{student.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-lg">@{student.username}</p>
                  </div>
                  {student.schoolName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">School</label>
                      <p className="text-lg">{student.schoolName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Info</label>
                    <p className="text-lg">{student.contactInfo || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pokemon">
            <Card>
              <CardHeader>
                <CardTitle>Pokémon Collection ({student.pokemonCollection.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {student.pokemonCollection.length > 0 ? (
                  <PokemonList pokemons={student.pokemonCollection} onPokemonClick={() => {}} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No Pokémon collected yet</p>
                    <p className="text-sm">Start collecting Pokémon to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No achievements yet</p>
                  <p className="text-sm">Achievements will appear here as you progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfilePage;
