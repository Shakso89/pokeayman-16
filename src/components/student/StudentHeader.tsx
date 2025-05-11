
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, MessageSquare, School, Sword } from "lucide-react";
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

  return (
    <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-red-400 to-red-500 text-white">
      <CardContent className="p-6">
        <h2 className="text-3xl font-bold mb-2 text-center md:text-left">Welcome, {studentName}!</h2>
        <div className="flex flex-col md:flex-row items-center justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span className="font-bold">{coins} Coins</span>
          </div>
          
          <div className="flex gap-2">
            {activeBattles.length > 0 && (
              <Button 
                className="bg-red-500 hover:bg-red-600 flex items-center gap-2" 
                onClick={() => navigate("/student/battles")}
              >
                <Sword className="h-4 w-4" />
                Active Battles ({activeBattles.length})
              </Button>
            )}
            
            <Button 
              className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2" 
              onClick={() => navigate("/student/messages")}
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentHeader;
