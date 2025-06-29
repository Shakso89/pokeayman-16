
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Book, Trophy, ShoppingCart, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

interface StudentDashboardButtonsProps {
  coins: number;
  studentId: string;
  onCollectionClick: () => void;
  onShopClick: () => void;
  onHomeworkClick: () => void;
}

const StudentDashboardButtons: React.FC<StudentDashboardButtonsProps> = ({
  coins,
  studentId,
  onCollectionClick,
  onShopClick,
  onHomeworkClick
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRankingsClick = () => {
    navigate("/student-ranking");
  };

  const handleViewClassClick = () => {
    // Navigate to a class details page - you might need to adjust this based on your routing
    const classId = localStorage.getItem("studentClassId"); // Assuming class ID is stored
    if (classId) {
      navigate(`/student/class/${classId}`);
    } else {
      console.warn("No class ID found for student");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Homework Button */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onHomeworkClick}>
        <CardContent className="p-4 md:p-6 text-center">
          <Book className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-red-500" />
          <h3 className="text-lg md:text-xl font-bold mb-2">{t("homework")}</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            Complete assignments and earn coins
          </p>
          <Button className="w-full bg-red-500 hover:bg-red-600">
            View Homework
          </Button>
        </CardContent>
      </Card>

      {/* Collection Button */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCollectionClick}>
        <CardContent className="p-4 md:p-6 text-center">
          <Trophy className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-blue-500" />
          <h3 className="text-lg md:text-xl font-bold mb-2">{t("my-pokemon-collection")}</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            View your Pokémon collection
          </p>
          <Button className="w-full bg-blue-500 hover:bg-blue-600">
            View Collection
          </Button>
        </CardContent>
      </Card>

      {/* Shop Button */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onShopClick}>
        <CardContent className="p-4 md:p-6 text-center">
          <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-yellow-500" />
          <h3 className="text-lg md:text-xl font-bold mb-2">Shop</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            Buy Pokémon with your coins
          </p>
          <div className="flex items-center justify-center gap-1 mb-3">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-yellow-600">{coins}</span>
          </div>
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
            Visit Shop
          </Button>
        </CardContent>
      </Card>

      {/* Rankings Button */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleRankingsClick}>
        <CardContent className="p-4 md:p-6 text-center">
          <Trophy className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-orange-500" />
          <h3 className="text-lg md:text-xl font-bold mb-2">Rankings</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            View student rankings and leaderboards
          </p>
          <Button className="w-full bg-orange-500 hover:bg-orange-600">
            View Rankings
          </Button>
        </CardContent>
      </Card>

      {/* View Class Button */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewClassClick}>
        <CardContent className="p-4 md:p-6 text-center">
          <Users className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-green-500" />
          <h3 className="text-lg md:text-xl font-bold mb-2">My Class</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            View your classmates and class information
          </p>
          <Button className="w-full bg-green-500 hover:bg-green-600">
            View Class
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardButtons;
