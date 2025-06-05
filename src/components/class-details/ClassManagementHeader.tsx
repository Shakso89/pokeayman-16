import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User, Users, Settings, BookText, PlusCircle, Coins, Award, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
interface ClassManagementHeaderProps {
  classData: any;
  studentsCount: number;
  isClassCreator: boolean;
  onAddStudent: () => void;
  onSwitchToHomework: () => void;
  pendingSubmissions: number;
}
const ClassManagementHeader: React.FC<ClassManagementHeaderProps> = ({
  classData,
  studentsCount,
  isClassCreator,
  onAddStudent,
  onSwitchToHomework,
  pendingSubmissions
}) => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  return <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/teacher-dashboard")} className="text-white hover:bg-white/20 mr-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Button>
        </div>

        {/* Class Title and Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{classData.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Created: {new Date(classData.createdAt || classData.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Creator: {isClassCreator ? "You" : "Teacher"}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Students: {studentsCount}
            </div>
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Class Manager
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isClassCreator && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={onSwitchToHomework} className="bg-green-500 hover:bg-green-600 text-white relative">
              <BookText className="h-4 w-4 mr-2" />
              Homework
              {pendingSubmissions > 0 && <Badge variant="destructive" className="ml-2">
                  {pendingSubmissions}
                </Badge>}
            </Button>
            
            <Button onClick={onAddStudent} className="bg-blue-500 hover:bg-blue-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Students
            </Button>
            
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Coins className="h-4 w-4 mr-2" />
              Award Coins
            </Button>
            
            
          </div>}
      </div>
    </div>;
};
export default ClassManagementHeader;