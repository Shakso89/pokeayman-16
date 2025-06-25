
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Coins, Star, Loader2, User } from "lucide-react";
import { StudentRanking, calculateGlobalStudentRankings } from "@/services/studentRankingService";

interface GlobalRankingDisplayProps {
  currentStudentId?: string;
  showTopOnly?: boolean;
  limit?: number;
}

const GlobalRankingDisplay: React.FC<GlobalRankingDisplayProps> = ({
  currentStudentId,
  showTopOnly = false,
  limit = 50
}) => {
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allRankings = await calculateGlobalStudentRankings();
      
      let displayRankings = allRankings;
      
      if (showTopOnly) {
        displayRankings = allRankings.slice(0, limit);
      } else if (limit) {
        displayRankings = allRankings.slice(0, limit);
      }
      
      setRankings(displayRankings);
    } catch (err) {
      console.error('Error loading rankings:', err);
      setError('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-300" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-blue-600 text-white";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading global rankings...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadRankings}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <User className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-semibold">No rankings available yet</p>
          <p className="text-sm">Students will appear here as they collect Pokemon and earn coins</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Global Student Rankings
          <Badge variant="outline" className="ml-auto">
            {rankings.length} students
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankings.map((student) => (
            <div
              key={student.id}
              className={`flex items-center p-4 rounded-lg border transition-colors ${
                student.id === currentStudentId
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                  : student.rank <= 3
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mr-4">
                {getRankIcon(student.rank)}
                <Badge className={`font-bold ${getRankBadgeColor(student.rank)}`}>
                  #{student.rank}
                </Badge>
              </div>

              <Avatar className="h-12 w-12 mr-4 border-2 border-primary/20">
                <AvatarImage src={student.avatarUrl} alt={student.displayName} />
                <AvatarFallback>
                  {student.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {student.displayName}
                </h3>
                <p className="text-sm text-gray-500 truncate">@{student.username}</p>
                {student.schoolName && (
                  <p className="text-xs text-gray-400 truncate">{student.schoolName}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="flex items-center gap-1 mb-1">
                    <Coins className="h-3 w-3 text-green-600" />
                    {student.coins}
                  </Badge>
                  <span className="text-xs text-gray-500">coins</span>
                </div>

                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3 text-blue-600" />
                    {student.pokemonCount}
                  </Badge>
                  <span className="text-xs text-gray-500">pokemon</span>
                </div>

                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="flex items-center gap-1 mb-1">
                    <Trophy className="h-3 w-3 text-purple-600" />
                    {student.pokemonValue}
                  </Badge>
                  <span className="text-xs text-gray-500">value</span>
                </div>

                <div className="flex flex-col items-center">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold">
                    {student.totalScore}
                  </Badge>
                  <span className="text-xs text-gray-500">total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalRankingDisplay;
