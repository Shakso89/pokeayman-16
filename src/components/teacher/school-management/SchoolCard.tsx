import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, BookOpen, Eye, RefreshCw, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface SchoolWithCounts {
  id: string;
  name: string;
  student_count: number;
  class_count: number;
}
interface SchoolCardProps {
  school: SchoolWithCounts;
  onViewSchoolPool: (schoolId: string) => void;
  onRefresh: () => void;
  onSelectSchool: (schoolId: string) => void;
  onManageClasses: (schoolId: string) => void;
}
const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onViewSchoolPool,
  onRefresh,
  onSelectSchool,
  onManageClasses
}) => {
  const navigate = useNavigate();
  const handleViewRankings = () => {
    navigate(`/school-rankings/${school.id}`);
  };
  return <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <School className="h-5 w-5 text-blue-600" />
          <span className="truncate" title={school.name}>{school.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-gray-600 mb-1">Students</p>
            <p className="font-bold text-blue-600 text-lg">{school.student_count}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <BookOpen className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-600 mb-1">Classes</p>
            <p className="font-bold text-green-600 text-lg">{school.class_count}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewSchoolPool(school.id)} className="flex items-center gap-1 text-xs font-normal px-[94px] py-0 mx-0 text-slate-100 bg-cyan-800 hover:bg-cyan-700">
            <Eye className="h-3 w-3" />
            Pool
          </Button>
          
        </div>

        <div className="space-y-2 mt-auto">
          <Button variant="ranking" onClick={handleViewRankings} className="w-full flex items-center gap-2 text-sm" size="sm">
            <Trophy className="h-4 w-4" />
            View Rankings
          </Button>
          
          <Button onClick={() => onSelectSchool(school.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">Classes</Button>
          
          
        </div>
      </CardContent>
    </Card>;
};
export default SchoolCard;