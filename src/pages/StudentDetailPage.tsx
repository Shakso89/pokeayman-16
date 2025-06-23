import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Coins, Award, Settings } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";
import PokemonList from "@/components/student/PokemonList";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import RemoveCoinsDialog from "@/components/dialogs/RemoveCoinsDialog";

interface StudentDetail {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coins: number;
  pokemonCount: number;
  homeworkCount: number;
  lastActive: string;
  createdAt: string;
}

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManagePokemon, setShowManagePokemon] = useState(false);
  const [showGiveCoins, setShowGiveCoins] = useState(false);
  const [showRemoveCoins, setShowRemoveCoins] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      // Get student basic info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;

      // Get student's Pokemon
      const { data: pokemonData, error: pokemonError } = await supabase
        .from("pokemon_collections")
        .select(`
          *,
          pokemon_catalog!inner(*)
        `)
        .eq("student_id", studentId);

      if (pokemonError) throw pokemonError;

      // Transform Pokemon data
      const transformedPokemon: Pokemon[] = (pokemonData || []).map((item: any) => ({
        id: item.pokemon_catalog.id.toString(),
        name: item.pokemon_catalog.name,
        image_url: item.pokemon_catalog.image || '',
        type_1: item.pokemon_catalog.type || 'normal',
        type_2: undefined,
        rarity: item.pokemon_catalog.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        price: 15,
        description: undefined,
        power_stats: item.pokemon_catalog.power_stats
      }));

      // Get homework submissions count
      const { data: homeworkData } = await supabase
        .from("homework_submissions")
        .select("id")
        .eq("student_id", studentId);

      setStudent({
        id: studentData.id,
        username: studentData.username,
        displayName: studentData.display_name || studentData.username,
        avatar: studentData.profile_photo,
        coins: studentData.coins || 0,
        pokemonCount: transformedPokemon.length,
        homeworkCount: homeworkData?.length || 0,
        lastActive: studentData.last_login || studentData.created_at,
        createdAt: studentData.created_at
      });

      setPokemon(transformedPokemon);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRefreshData = () => {
    fetchStudentDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType="teacher" userName={localStorage.getItem("teacherDisplayName") || "Teacher"} />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading student details...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType="teacher" userName={localStorage.getItem("teacherDisplayName") || "Teacher"} />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Student not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="teacher" userName={localStorage.getItem("teacherDisplayName") || "Teacher"} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBackClick} className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Student Profile</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowGiveCoins(true)}
            >
              <Coins className="h-4 w-4 mr-2" />
              Give Coins
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveCoins(true)}
            >
              <Coins className="h-4 w-4 mr-2" />
              Remove Coins
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowManagePokemon(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Pokemon
            </Button>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="text-lg">
                  {student.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{student.displayName}</h2>
                <p className="text-gray-500">@{student.username}</p>
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline">
                    <Coins className="h-3 w-3 mr-1" />
                    {student.coins} coins
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {student.pokemonCount} Pokemon
                  </Badge>
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    {student.homeworkCount} homework
                  </Badge>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <p>Last Active: {new Date(student.lastActive).toLocaleDateString()}</p>
                <p>Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.coins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pokemon Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.pokemonCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Activity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pokemon Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Pokemon Collection ({pokemon.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pokemon.length > 0 ? (
              <PokemonList pokemons={pokemon} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                This student hasn't collected any Pokemon yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ManagePokemonDialog
        open={showManagePokemon}
        onOpenChange={setShowManagePokemon}
        studentId={student.id}
        studentName={student.displayName}
        onPokemonUpdated={handleRefreshData}
      />

      <GiveCoinsDialog
        isOpen={showGiveCoins}
        onOpenChange={setShowGiveCoins}
        studentId={student.id}
        studentName={student.displayName}
        onGiveCoins={handleRefreshData}
        teacherId={localStorage.getItem("teacherId") || ""}
        classId=""
        schoolId=""
      />

      <RemoveCoinsDialog
        isOpen={showRemoveCoins}
        onOpenChange={setShowRemoveCoins}
        studentId={student.id}
        studentName={student.displayName}
        onRemoveCoins={handleRefreshData}
        teacherId={localStorage.getItem("teacherId") || ""}
        classId=""
        schoolId=""
      />
    </div>
  );
};

export default StudentDetailPage;
