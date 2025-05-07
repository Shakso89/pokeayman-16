
import React from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Sword, Award } from "lucide-react";

const StudentDashboard: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentName = localStorage.getItem("studentName") || "Student";

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  // Get battles from localStorage
  const battles = JSON.parse(localStorage.getItem("battles") || "[]");
  const activeBattles = battles.filter((battle: any) => battle.status === "active");

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="student" userName={studentName} />
      
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-2">Welcome, {studentName}!</h2>
        <p className="text-gray-500 mb-6">Here's what's happening today</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Active Battles</h3>
            {activeBattles.length > 0 ? (
              <div className="space-y-4">
                {activeBattles.map((battle: any) => (
                  <Card key={battle.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Sword className="h-5 w-5 text-red-500" />
                        {battle.name}
                      </CardTitle>
                      <CardDescription>
                        {battle.participantType === "individual" ? "Individual Battle" : "Class Battle"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{battle.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <Sword className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="text-lg font-medium mb-1">No Active Battles</h3>
                    <p className="text-gray-500">Check back later for new challenges.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Total Points</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Sword className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Battles Won</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Sword className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Battles Participated</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
