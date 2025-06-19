import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { Pokemon } from "@/types/pokemon";

const ReportsPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const username = localStorage.getItem("teacherUsername") || "";
  
  const { t } = useTranslation();
  const { userRole, isLoading: roleLoading } = useUserRole();
  
  const [participationData, setParticipationData] = useState<any[]>([]);
  const [pokemonDistribution, setPokemonDistribution] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  
  // Check if user is owner
  const isOwner = userRole === 'owner' || 
                  username === 'Ayman' || 
                  username === 'Admin' ||
                  localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (isLoggedIn && userType === "teacher" && isOwner) {
      generateReports();
    }
  }, [isLoggedIn, userType, isOwner]);
  
  const generateReports = () => {
    // Get all necessary data
    const battles = JSON.parse(localStorage.getItem("battles") || "[]");
    const teacherBattles = battles.filter((battle: any) => battle.createdBy === teacherId);
    
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const teacherStudents = students.filter((student: any) => student.teacherId === teacherId);
    
    const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
    
    // Generate participation data
    const participationStats: Record<string, { participated: number, total: number, name: string }> = {};
    
    teacherBattles.forEach((battle: any) => {
      const schoolId = battle.schoolId;
      const schoolStudents = teacherStudents.filter((student: any) => student.schoolId === schoolId);
      
      if (!participationStats[schoolId]) {
        // Find school name
        const schools = JSON.parse(localStorage.getItem("schools") || "[]");
        const school = schools.find((s: any) => s.id === schoolId);
        
        participationStats[schoolId] = {
          participated: 0,
          total: schoolStudents.length,
          name: school ? school.name : `School ${schoolId}`
        };
      }
      
      battle.participants?.forEach((participantId: string) => {
        if (schoolStudents.find((student: any) => student.id === participantId)) {
          participationStats[schoolId].participated++;
        }
      });
    });
    
    const participationArray = Object.values(participationStats);
    setParticipationData(participationArray);
    
    // Generate Pokemon distribution
    const pokemonTypes: Record<string, number> = {};
    const pokemonRarities: Record<string, number> = {};
    
    teacherStudents.forEach((student: any) => {
      const pokemon = studentPokemons.find((p: any) => p.studentId === student.id);
      
      if (pokemon && pokemon.pokemons) {
        pokemon.pokemons.forEach((p: Pokemon) => {
          // Count by type
          pokemonTypes[p.type] = (pokemonTypes[p.type] || 0) + 1;
          
          // Count by rarity
          pokemonRarities[p.rarity] = (pokemonRarities[p.rarity] || 0) + 1;
        });
      }
    });
    
    const typeData = Object.entries(pokemonTypes).map(([type, count]) => ({
      name: type,
      count
    }));
    
    const rarityData = Object.entries(pokemonRarities).map(([rarity, count]) => ({
      name: rarity,
      count
    }));
    
    setPokemonDistribution([...typeData, ...rarityData]);
    
    // Generate engagement data over time (mock data for now)
    const now = new Date();
    const engagementMockData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      engagementMockData.push({
        date: date.toLocaleDateString(),
        battles: Math.floor(Math.random() * 5),
        messages: Math.floor(Math.random() * 20),
        logins: Math.floor(Math.random() * 15)
      });
    }
    
    setEngagementData(engagementMockData);
  };
  
  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in or not a teacher
  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  // Show access denied if not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar userType="teacher" userName={username} />
        
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            <h1 className="text-3xl font-bold">Access Denied</h1>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Owner Access Required</h2>
              <p className="text-gray-600">
                This reports page is only accessible to system owners.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName={username} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            {t("reports-analytics")} (Owner Only)
          </h1>
        </div>
        
        <Tabs defaultValue="participation">
          <TabsList className="mb-6">
            <TabsTrigger value="participation">{t("participation")}</TabsTrigger>
            <TabsTrigger value="pokemon">{t("pokemon-distribution")}</TabsTrigger>
            <TabsTrigger value="engagement">{t("engagement")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="participation">
            <Card>
              <CardHeader>
                <CardTitle>{t("student-participation")}</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {participationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={participationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="participated" fill="#8884d8" name={t("participated")} />
                      <Bar dataKey="total" fill="#82ca9d" name={t("total-students")} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{t("no-participation-data")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pokemon">
            <Card>
              <CardHeader>
                <CardTitle>{t("pokemon-distribution")}</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {pokemonDistribution.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{t("by-type")}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pokemonDistribution.filter(item => !['common', 'uncommon', 'rare', 'legendary'].includes(item.name))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pokemonDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">{t("by-rarity")}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pokemonDistribution.filter(item => ['common', 'uncommon', 'rare', 'legendary'].includes(item.name))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pokemonDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{t("no-pokemon-distribution-data")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>{t("student-engagement")}</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={engagementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="logins" fill="#8884d8" name={t("logins")} />
                    <Bar dataKey="battles" fill="#82ca9d" name={t("battle-participation")} />
                    <Bar dataKey="messages" fill="#ffc658" name={t("messages")} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsPage;
