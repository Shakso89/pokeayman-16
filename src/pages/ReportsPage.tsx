
import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";

interface StudentReport {
  id: string;
  displayName: string;
  username: string;
  coins: number;
  pokemonCount: number;
  homeworkCount: number;
  lastActive: string;
  pokemon: Pokemon[];
}

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const userType = localStorage.getItem("userType") as "teacher" | "student";

  useEffect(() => {
    fetchStudentsReport();
  }, []);

  const fetchStudentsReport = async () => {
    try {
      setLoading(true);
      const teacherId = localStorage.getItem("teacherId");
      
      // Get all students for this teacher
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("is_active", true);

      if (studentsError) throw studentsError;

      // For each student, get their stats
      const reportsPromises = (studentsData || []).map(async (student) => {
        // Get Pokemon count and data
        const { data: pokemonData } = await supabase
          .from("student_pokemon_collection")
          .select(`
            *,
            pokemon_pool!fk_pokemon_pool (*)
          `)
          .eq("student_id", student.id);

        // Transform Pokemon data
        const pokemon: Pokemon[] = (pokemonData || []).map((item: any) => ({
          id: item.pokemon_pool.id,
          name: item.pokemon_pool.name,
          image_url: item.pokemon_pool.image_url || '',
          type_1: item.pokemon_pool.type_1 || 'normal',
          type_2: item.pokemon_pool.type_2,
          rarity: item.pokemon_pool.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
          price: item.pokemon_pool.price || 15,
          description: item.pokemon_pool.description,
          power_stats: item.pokemon_pool.power_stats
        }));

        // Get homework submissions count
        const { data: homeworkData } = await supabase
          .from("homework_submissions")
          .select("id")
          .eq("student_id", student.id);

        return {
          id: student.id,
          displayName: student.display_name || student.username,
          username: student.username,
          coins: student.coins || 0,
          pokemonCount: pokemon.length,
          homeworkCount: homeworkData?.length || 0,
          lastActive: student.last_login || student.created_at,
          pokemon
        };
      });

      const reports = await Promise.all(reportsPromises);
      setStudents(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const exportReport = () => {
    // Create CSV content
    const headers = ["Student Name", "Username", "Coins", "Pokemon Count", "Homework Count", "Last Active", "Pokemon Types"];
    const rows = students.map(student => [
      student.displayName,
      student.username,
      student.coins,
      student.pokemonCount,
      student.homeworkCount,
      new Date(student.lastActive).toLocaleDateString(),
      student.pokemon.map(p => p.type_1).filter((type, index, arr) => arr.indexOf(type) === index).join(", ")
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPokemonTypeDistribution = (pokemon: Pokemon[]) => {
    const types = pokemon.map(p => p.type_1).filter(Boolean);
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => `${type} (${count})`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType={userType} userName={localStorage.getItem("teacherDisplayName") || "Teacher"} />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType={userType} userName={localStorage.getItem("teacherDisplayName") || "Teacher"} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBackClick} className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Student Reports</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Pokemon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce((sum, student) => sum + student.pokemonCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce((sum, student) => sum + student.coins, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Homework Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce((sum, student) => sum + student.homeworkCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Student Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{student.displayName}</h3>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{student.coins} coins</Badge>
                      <Badge variant="outline">{student.pokemonCount} Pokemon</Badge>
                      <Badge variant="outline">{student.homeworkCount} homework</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Last Active:</span>
                      <p>{new Date(student.lastActive).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Pokemon Types:</span>
                      <p>{getPokemonTypeDistribution(student.pokemon).join(", ") || "None"}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Activity Score:</span>
                      <p>{student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
