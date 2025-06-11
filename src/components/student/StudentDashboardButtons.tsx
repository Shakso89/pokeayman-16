
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface StudentDashboardButtonsProps {
  coins: number;
  studentId: string;
  onMysteryBallClick: () => void;
  onCollectionClick: () => void;
}

const StudentDashboardButtons: React.FC<StudentDashboardButtonsProps> = ({
  coins,
  studentId,
  onMysteryBallClick,
  onCollectionClick
}) => {
  const navigate = useNavigate();

  const handleHomeworkClick = () => {
    // Navigate to homework tab within student dashboard
    navigate("/student-dashboard?tab=my-classes");
  };

  const handleMysteryBallClick = () => {
    if (coins < 5) {
      toast({
        title: "Not Enough Coins",
        description: "You need at least 5 coins to open the Mystery Ball.",
        variant: "destructive"
      });
      return;
    }
    onMysteryBallClick();
  };

  const handleRankingsClick = () => {
    navigate("/student/rankings");
  };

  const handleCollectionClick = () => {
    onCollectionClick();
  };

  return (
    <div className="grid grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
      {/* Homework Button */}
      <Card className="group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-transparent border-none">
        <CardContent className="p-3 text-center bg-transparent">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/67f4be5b-602a-4bbc-8a4a-945343f4a445.png" 
              alt="Homework" 
              onClick={handleHomeworkClick}
              style={{ background: 'transparent' }}
              className="w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-300 cursor-pointer" 
            />
          </div>
          <Button 
            onClick={handleHomeworkClick} 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 rounded-lg shadow-md text-lg"
          >
            Homework
          </Button>
        </CardContent>
      </Card>

      {/* Mystery Ball Button */}
      <Card className="group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-transparent border-none">
        <CardContent className="p-3 text-center bg-transparent">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/cffa8d85-2864-4a9c-b70e-7e9ed1d2502d.png" 
              alt="Mystery Ball" 
              onClick={handleMysteryBallClick}
              style={{ background: 'transparent' }}
              className="w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-300 cursor-pointer" 
            />
          </div>
          <Button 
            onClick={handleMysteryBallClick} 
            disabled={coins < 5} 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 rounded-lg shadow-md disabled:opacity-50 text-lg"
          >
            Mystery Ball (5 coins)
          </Button>
        </CardContent>
      </Card>

      {/* Rankings Button */}
      <Card className="group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-transparent border-none">
        <CardContent className="p-3 text-center bg-transparent">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/d6808080-692e-488b-a4f9-2e39e044504f.png" 
              alt="Rankings" 
              onClick={handleRankingsClick}
              style={{ background: 'transparent' }}
              className="w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-300 cursor-pointer" 
            />
          </div>
          <Button 
            onClick={handleRankingsClick} 
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-lg shadow-md text-lg"
          >
            Rankings Class & School
          </Button>
        </CardContent>
      </Card>

      {/* Collection & Pool Button */}
      <Card className="group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-transparent border-none">
        <CardContent className="p-3 text-center bg-transparent">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/1c23142a-78df-44ca-8237-e3e245615d65.png" 
              alt="Collection" 
              onClick={handleCollectionClick}
              style={{ background: 'transparent' }}
              className="w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-300 cursor-pointer" 
            />
          </div>
          <Button 
            onClick={handleCollectionClick} 
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 rounded-lg shadow-md text-lg"
          >
            Collection Pokémon & Pool
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardButtons;
