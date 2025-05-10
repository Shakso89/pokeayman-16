
import React from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { BattleCard } from "@/components/battles/BattleCard";
import { CompletedBattleCard } from "@/components/battles/CompletedBattleCard";
import { BattleSubmission } from "@/components/battles/BattleSubmission";
import { EmptyBattleState } from "@/components/battles/EmptyBattleState";
import { useBattles } from "@/hooks/useBattles";
import { useTranslation } from "@/hooks/useTranslation";

const StudentBattlePage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentId = localStorage.getItem("studentId");
  const studentName = localStorage.getItem("studentName");
  const classId = localStorage.getItem("studentClassId");
  const schoolId = localStorage.getItem("studentSchoolId");
  
  const { t } = useTranslation();
  
  const {
    activeBattles,
    completedBattles,
    selectedBattle,
    setSelectedBattle,
    joinBattle,
    updateBattle,
    formatDateTime,
    isExpired,
    hasSubmittedAnswer,
    getTimeRemaining
  } = useBattles(studentId, schoolId, classId);
  
  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="student" userName={studentName || ""} />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{t("battle-arena")}</h1>
        
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              {t("active-battles")}
              {activeBattles.length > 0 && (
                <Badge variant="destructive" className="ml-2">{activeBattles.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">{t("completed-battles")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {selectedBattle ? (
              <div className="space-y-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBattle(null)}
                >
                  {t("back-to-battles")}
                </Button>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl">{selectedBattle.name}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {getTimeRemaining(selectedBattle.timeLimit)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">{selectedBattle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BattleSubmission 
                      selectedBattle={selectedBattle}
                      studentId={studentId}
                      studentName={studentName}
                      hasSubmittedAnswer={hasSubmittedAnswer}
                      formatDateTime={formatDateTime}
                      getTimeRemaining={getTimeRemaining}
                      onBattleUpdate={updateBattle}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {t("ends-at")}: {formatDateTime(selectedBattle.timeLimit)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedBattle.participants?.length || 0} {t("participants")}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ) : activeBattles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBattles.map(battle => (
                  <BattleCard
                    key={battle.id}
                    battle={battle}
                    studentId={studentId}
                    hasSubmittedAnswer={hasSubmittedAnswer}
                    getTimeRemaining={getTimeRemaining}
                    formatDateTime={formatDateTime}
                    onBattleSelect={setSelectedBattle}
                    joinBattle={joinBattle}
                  />
                ))}
              </div>
            ) : (
              <EmptyBattleState type="active" />
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedBattles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBattles.map(battle => (
                  <CompletedBattleCard
                    key={battle.id}
                    battle={battle}
                    studentId={studentId}
                    formatDateTime={formatDateTime}
                    isExpired={isExpired}
                  />
                ))}
              </div>
            ) : (
              <EmptyBattleState type="completed" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentBattlePage;
