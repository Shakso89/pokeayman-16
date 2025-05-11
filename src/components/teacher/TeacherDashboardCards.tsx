
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { School, MessageSquare, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeacherDashboardCardsProps {
  onManageClassesClick: () => void;
  isAdmin: boolean;
}

const TeacherDashboardCards: React.FC<TeacherDashboardCardsProps> = ({ 
  onManageClassesClick,
  isAdmin
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6 text-blue-500" />
            Manage Classes
          </CardTitle>
          <CardDescription>
            {isAdmin ? "Manage schools and their classes" : "Manage your classes and students"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {isAdmin 
              ? "Create, update and delete schools and classes" 
              : "Create and manage classes, add students"}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button" 
            onClick={onManageClassesClick}
          >
            Manage Classes
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-500" />
            Messages
          </CardTitle>
          <CardDescription>
            School Collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Connect with other schools and teachers
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button"
            onClick={() => navigate("/teacher/messages")}
          >
            Messages
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-purple-500" />
            Reports & Analytics
          </CardTitle>
          <CardDescription>
            Student Participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Track student engagement and progress
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button"
            onClick={() => navigate("/teacher/reports")}
          >
            Reports & Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherDashboardCards;
