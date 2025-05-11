
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeacherDashboardHeaderProps {
  isAdmin: boolean;
}

const TeacherDashboardHeader: React.FC<TeacherDashboardHeaderProps> = ({ isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome Teacher</h2>
            <p>Manage your classes, students and more.</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => navigate("/admin-dashboard")}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherDashboardHeader;
