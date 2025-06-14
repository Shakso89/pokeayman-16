import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Flame, Award, Coins } from "lucide-react";
import { Achievement } from "@/services/studentDatabase";

interface AchievementsDisplayProps {
  achievements: Achievement[];
  homeworkStreak: number;
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({
  achievements,
  homeworkStreak
}) => {
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'star_of_class':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'homework_streak':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'pokemon_master':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'coin_collector':
        return <Coins className="h-5 w-5 text-yellow-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAchievementTitle = (type: string) => {
    switch (type) {
      case 'star_of_class':
        return 'Star of the Class';
      case 'homework_streak':
        return 'Homework Streak';
      case 'pokemon_master':
        return 'Pokemon Master';
      case 'coin_collector':
        return 'Coin Collector';
      default:
        return 'Achievement';
    }
  };

  const getAchievementDescription = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'star_of_class':
        return `Earned ${achievement.value} coins for excellence in class`;
      case 'homework_streak':
        return `${achievement.value} days streak`;
      case 'pokemon_master':
        return `Collected ${achievement.value} Pokemon`;
      case 'coin_collector':
        return `Earned ${achievement.value} total coins`;
      default:
        return 'Special achievement';
    }
  };

  const starOfClassAchievement = achievements.find(a => a.type === 'star_of_class');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Homework Streak */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800">Homework Streak</p>
                <p className="text-sm text-orange-600">
                  {homeworkStreak > 0 
                    ? `${homeworkStreak} days in a row!` 
                    : 'Start your streak today!'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {homeworkStreak} days
            </Badge>
          </div>

          {/* Star of Class */}
          {starOfClassAchievement && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-800">⭐ Star of the Class</p>
                  <p className="text-sm text-yellow-600">
                    {getAchievementDescription(starOfClassAchievement)}
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-500 text-white">
                Active
              </Badge>
            </div>
          )}

          {/* Other Achievements */}
          {achievements
            .filter(a => a.type !== 'star_of_class')
            .map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getAchievementIcon(achievement.type)}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {getAchievementTitle(achievement.type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getAchievementDescription(achievement)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {achievement.value}
                </Badge>
              </div>
            ))}

          {achievements.length === 0 && homeworkStreak === 0 && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No achievements yet</p>
              <p className="text-sm text-gray-400">
                Complete homework and participate in class to earn achievements!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsDisplay;
