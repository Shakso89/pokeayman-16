
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, Coins, Trophy, Settings, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentHeaderProps {
  studentName: string;
  coins: number;
  activeBattles: any[];
  onOpenSchoolPool: () => void;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({
  studentName,
  coins,
  activeBattles,
  onOpenSchoolPool
}) => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId");
  const avatar = localStorage.getItem("studentAvatar");

  const handleViewProfile = () => {
    if (studentId) {
      navigate(`/student-profile/${studentId}`);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-16 w-16 border-4 border-white/20 cursor-pointer hover:border-white/40 transition-colors">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-xl">
                    {studentName?.[0]?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome, {studentName}!</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  <Coins className="mr-1 h-4 w-4" />
                  {coins} coins
                </Badge>
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <Trophy className="mr-1 h-4 w-4" />
                  Active Student
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {activeBattles.length > 0 && (
              <Badge variant="secondary" className="bg-red-500 text-white">
                {activeBattles.length} Active Battle{activeBattles.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onOpenSchoolPool}
            >
              <Trophy className="mr-2 h-4 w-4" />
              School Pool
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentHeader;
