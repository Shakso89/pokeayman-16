import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Trophy, Coins, Award, Crown } from 'lucide-react';
import { getStudentRankings, getStudentRank, type RankingStudent } from '@/services/studentRankingService';

const StudentRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStudentRank, setCurrentStudentRank] = useState<number | null>(null);

  const userType = localStorage.getItem("userType") || "student";
  const userName = localStorage.getItem("studentDisplayName") || "Student";
  const currentStudentId = localStorage.getItem("studentId");
  const schoolId = localStorage.getItem("studentSchoolId");

  const handleBackClick = () => {
    navigate("/student-dashboard");
  };

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        console.log("🔍 Fetching student rankings...");

        // Use the unified ranking service
        const rankingsData = await getStudentRankings(schoolId || undefined);
        setRankings(rankingsData);

        // Find current student's rank
        if (currentStudentId) {
          const rank = await getStudentRank(currentStudentId, schoolId || undefined);
          setCurrentStudentRank(rank);
        }

        console.log("✅ Rankings loaded successfully:", rankingsData.length);
      } catch (error) {
        console.error("❌ Error loading rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [schoolId, currentStudentId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AppHeader userType={userType as "student"} userName={userName} />
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-4">
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold">School Rankings</h1>
        </div>

        {currentStudentRank && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Rank</h2>
                <div className="text-4xl font-bold">#{currentStudentRank}</div>
                <p className="text-blue-100 mt-2">Keep collecting Pokémon and coins to climb higher!</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              School Leaderboard
            </CardTitle>
            <p className="text-sm text-gray-600">
              Rankings based on coins + Pokémon collection (each Pokémon = 3 points)
            </p>
          </CardHeader>
          <CardContent>
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((student) => {
                  const isCurrentStudent = student.user_id === currentStudentId || student.id === currentStudentId;
                  
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentStudent 
                          ? 'bg-blue-50 border-blue-200 shadow-md' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(student.rank || 0)}
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            {student.display_name?.[0] || student.username?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {student.display_name || student.username}
                            {isCurrentStudent && (
                              <Badge variant="secondary" className="ml-2">You</Badge>
                            )}
                          </h3>
                          <p className="text-gray-600">@{student.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{student.coins}</span>
                          </div>
                          <p className="text-xs text-gray-500">Coins</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span className="font-semibold">{student.pokemon_count}</span>
                          </div>
                          <p className="text-xs text-gray-500">Pokémon</p>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRankBadgeColor(student.rank || 0)}`}>
                            {student.total_score} pts
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Total</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No rankings available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StudentRankingsPage;
