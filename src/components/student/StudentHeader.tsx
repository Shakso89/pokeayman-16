
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, MessageSquare, Sword } from "lucide-react";
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
    <Card className="mb-6 border-4 border-yellow-400 shadow-lg bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl">
      <CardContent className="p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Hi {studentName}!</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Button 
            onClick={onOpenSchoolPool}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-6 py-3 rounded-full shadow-md border-2 border-yellow-300 flex items-center gap-2 transform hover:scale-105 transition-all"
          >
            <Coins className="h-6 w-6" />
            <span className="font-bold">{coins} Coins</span>
          </Button>
          
          <div className="flex gap-3">
            {activeBattles.length > 0 && (
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-md border-2 border-red-300 flex items-center gap-2 transform hover:scale-105 transition-all" 
                onClick={() => navigate("/student/battles")}
              >
                <Sword className="h-6 w-6" />
                Battles ({activeBattles.length})
              </Button>
            )}
            
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-md border-2 border-green-300 flex items-center gap-2 transform hover:scale-105 transition-all"
              onClick={() => navigate("/student/messages")}
            >
              <MessageSquare className="h-6 w-6" />
              Messages
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentHeader;
