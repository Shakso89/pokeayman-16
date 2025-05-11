
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Trophy, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

// Import our components
import StudentCollection from "@/components/student/StudentCollection";
import MysteryBallTab from "@/components/student/MysteryBallTab";
import SchoolPoolDialog from "@/components/student/SchoolPoolDialog";
import MyClassesTab from "@/components/student/MyClassesTab";

interface StudentDashboardContentProps {
  studentName: string;
  studentId: string;
  classId: string;
  studentPokemons: Pokemon[];
  schoolPokemons: Pokemon[];
  coins: number;
  activeBattles: any[];
  showSchoolPool: boolean;
  setShowSchoolPool: (show: boolean) => void;
  isLoading: boolean;
  handlePokemonWon: (pokemon: Pokemon) => void;
  handleCoinsWon: (amount: number) => void;
  handleRefreshPool: () => void;
}

const StudentDashboardContent: React.FC<StudentDashboardContentProps> = ({
  studentName,
  studentId,
  classId,
  studentPokemons,
  schoolPokemons,
  coins,
  activeBattles,
  showSchoolPool,
  setShowSchoolPool,
  isLoading,
  handlePokemonWon,
  handleCoinsWon,
  handleRefreshPool
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("my-pokemons");
  
  // Get the current school ID (either from state or localStorage)
  const currentSchoolId = localStorage.getItem("studentSchoolId") || "default-school-1";

  return (
    <div className="mt-6 relative">
      <Tabs defaultValue="my-pokemons" className="w-full mt-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="my-pokemons">{t("my-pokemons")}</TabsTrigger>
          <TabsTrigger value="mystery-ball">{t("mystery-ball")}</TabsTrigger>
          <TabsTrigger value="school-pool">{t("school-pool")}</TabsTrigger>
          <TabsTrigger value="my-classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("my-classes")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-pokemons" className="mt-4">
          <StudentCollection pokemons={studentPokemons} />
        </TabsContent>
        
        <TabsContent value="mystery-ball" className="mt-4">
          <MysteryBallTab 
            schoolPokemons={schoolPokemons} 
            studentId={studentId} 
            schoolId={currentSchoolId} 
            coins={coins} 
            isLoading={isLoading} 
            onPokemonWon={handlePokemonWon} 
            onCoinsWon={handleCoinsWon} 
            onRefreshPool={handleRefreshPool} 
          />
        </TabsContent>
        
        <TabsContent value="school-pool" className="mt-4">
          <SchoolPokemonPoolTab schoolPokemons={schoolPokemons} />
        </TabsContent>
        
        <TabsContent value="my-classes" className="mt-4">
          <MyClassesTab studentId={studentId} studentName={studentName} classId={classId} />
        </TabsContent>
      </Tabs>
      
      {/* School Pool Dialog */}
      <SchoolPoolDialog open={showSchoolPool} onOpenChange={setShowSchoolPool} schoolPokemons={schoolPokemons} />
    </div>
  );
};

export default StudentDashboardContent;
