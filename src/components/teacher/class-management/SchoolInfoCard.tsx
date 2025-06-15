import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, Eye, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import SchoolPokemonPoolDialog from "@/components/dialogs/SchoolPokemonPoolDialog";
import { forceUpdateAllSchoolPools } from "@/utils/pokemon/schoolPokemon";
import { toast } from "@/hooks/use-toast";

interface SchoolInfoCardProps {
  schoolId: string;
  teacherId: string;
  isAdmin: boolean;
}

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({ schoolId, teacherId, isAdmin }) => {
  const { t } = useTranslation();
  const [schoolPoolOpen, setSchoolPoolOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock school data - in a real app, this would come from props or a hook
  const schoolData = {
    name: "School Name",
    studentCount: 0,
    classCount: 0
  };

  const handleRefreshPool = async () => {
    if (!isAdmin) {
      toast({
        title: t("error"),
        description: "Only admins can refresh the school Pokémon pool",
        variant: "destructive"
      });
      return;
    }

    setRefreshing(true);
    try {
      await forceUpdateAllSchoolPools();
      toast({
        title: t("success"),
        description: "School Pokémon pool has been refreshed with 500 new Pokémon"
      });
    } catch (error) {
      console.error("Error refreshing pool:", error);
      toast({
        title: t("error"),
        description: "Failed to refresh school Pokémon pool",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Card className="pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-500" />
            {t("school-information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-gray-500" />
              <span>{schoolData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{schoolData.studentCount} {t("students")}</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-gray-500" />
              <span>{schoolData.classCount} {t("classes")}</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => setSchoolPoolOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("view-school-pool")}
            </Button>
            
            {isAdmin && (
              <Button 
                onClick={handleRefreshPool}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t("refreshing") : t("refresh-pool")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SchoolPokemonPoolDialog
        isOpen={schoolPoolOpen}
        onOpenChange={setSchoolPoolOpen}
        schoolId={schoolId}
      />
    </>
  );
};

export default SchoolInfoCard;
