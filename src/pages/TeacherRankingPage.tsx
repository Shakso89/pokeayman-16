
import React from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users } from "lucide-react";
import GlobalRankingDisplay from "@/components/ranking/GlobalRankingDisplay";

const TeacherRankingPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="teacher" userName={teacherName} />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Student Performance Rankings
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Global Rankings
            </TabsTrigger>
            <TabsTrigger value="top10" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top 10
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <GlobalRankingDisplay showTopOnly={false} limit={100} />
          </TabsContent>

          <TabsContent value="top10">
            <GlobalRankingDisplay showTopOnly={true} limit={10} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherRankingPage;
