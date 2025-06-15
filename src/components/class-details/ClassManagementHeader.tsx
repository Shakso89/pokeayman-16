
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Trash2, School, HelpCircle, Eye, Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ClassManagementHeaderProps {
  classData: any;
  studentsCount: number;
  isClassCreator: boolean;
  onAddStudent: () => void;
  onSwitchToHomework: () => void;
  pendingSubmissions: number;
  onDeleteClass: () => void;
  onViewSchoolPool: () => void;
  onAddAssistant: () => void;
  onManagePokemon: () => void;
}

const ClassManagementHeader: React.FC<ClassManagementHeaderProps> = ({
  classData,
  studentsCount,
  isClassCreator,
  onAddStudent,
  onSwitchToHomework,
  pendingSubmissions,
  onDeleteClass,
  onViewSchoolPool,
  onAddAssistant,
  onManagePokemon
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
            <p className="text-blue-100 mb-4">{classData.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Users className="h-4 w-4" />
                <span>{studentsCount} {t("students")}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <School className="h-4 w-4" />
                <span>{t("class-id")}: {classData.id?.slice(0, 8)}</span>
              </div>
              {pendingSubmissions > 0 && (
                <div className="flex items-center gap-2 bg-orange-500/80 px-3 py-1 rounded-full">
                  <HelpCircle className="h-4 w-4" />
                  <span>{pendingSubmissions} {t("pending-submissions")}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onViewSchoolPool}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("view-school-pool")}
            </Button>
            
            <Button 
              onClick={onManagePokemon}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Pokémon
            </Button>
            
            {isClassCreator && (
              <>
                <Button 
                  onClick={onAddStudent}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("add-students")}
                </Button>
                
                <Button 
                  onClick={onAddAssistant}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("add-assistant")}
                </Button>
                
                <Button 
                  onClick={onSwitchToHomework}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t("homework")} {pendingSubmissions > 0 && `(${pendingSubmissions})`}
                </Button>
                
                <Button 
                  onClick={onDeleteClass}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete-class")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassManagementHeader;
