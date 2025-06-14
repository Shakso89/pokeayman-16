
import React from "react";
import { Star } from "lucide-react";

interface StudentProfileAchievementsProps {
  homeworkStreak: number;
  isStarOfClass: boolean;
}

const StudentProfileAchievements: React.FC<StudentProfileAchievementsProps> = ({
  homeworkStreak,
  isStarOfClass,
}) => (
  <div className="flex flex-col md:flex-row gap-3 py-4">
    <div className="flex-1 flex items-center gap-3 bg-blue-50 rounded-lg p-3">
      <span role="img" aria-label="streak" className="text-2xl">🔥</span>
      <span className="font-medium">Homework Streak:</span>
      <span className="text-xl font-bold text-blue-700">{homeworkStreak} day(s)</span>
    </div>
    {isStarOfClass && (
      <div className="flex-1 flex items-center gap-3 bg-yellow-50 rounded-lg p-3">
        <Star className="h-7 w-7 text-yellow-500" fill="gold" />
        <span className="font-medium">⭐ Star of The Class</span>
        <span className="text-green-800 font-semibold">(awarded +50 coins)</span>
      </div>
    )}
  </div>
);

export default StudentProfileAchievements;
