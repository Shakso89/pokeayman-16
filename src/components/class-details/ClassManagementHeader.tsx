import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, BookOpen, Trash2, Eye, UserCheck, Award, Star, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssignStarDialog from "@/components/dialogs/AssignStarDialog";
import { refreshTopStudents } from "@/services/studentBadgeService";
import { toast } from "@/hooks/use-toast";
interface ClassManagementHeaderProps {
  classData: {
    id: string;
    name: string;
    description?: string;
    star_student_id?: string;
    top_student_id?: string;
    school_id?: string;
    schools?: {
      name: string;
      top_student_id?: string;
    };
  };
  studentsCount: number;
  isClassCreator: boolean;
  onAddStudent: () => void;
  onSwitchToHomework: () => void;
  pendingSubmissions: number;
  onDeleteClass: () => void;
  onViewSchoolPool: () => void;
  onAddAssistant: () => void;
  onManagePokemon: () => void;
  students?: Array<{
    id: string;
    user_id: string;
    username: string;
    display_name?: string;
  }>;
  onStarAssigned?: () => void;
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
  onManagePokemon,
  students = [],
  onStarAssigned
}) => {
  const navigate = useNavigate();
  const [isAssignStarOpen, setIsAssignStarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshTopStudents = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshTopStudents();
      if (result.success) {
        toast({
          title: "Success",
          description: "Top students have been refreshed!"
        });
        if (onStarAssigned) {
          onStarAssigned(); // Refresh the class data
        }
      } else {
        throw new Error(result.error || "Failed to refresh");
      }
    } catch (error) {
      console.error("Error refreshing top students:", error);
      toast({
        title: "Error",
        description: "Failed to refresh top students",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  return <div className="transparent ">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/teacher-dashboard")} className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {classData.name}
            </h1>
            
            {classData.description && <p className="text-gray-600 mb-3">{classData.description}</p>}

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {studentsCount} Students
              </Badge>
              
              {classData.schools && <Badge variant="outline">
                  {classData.schools.name}
                </Badge>}

              {pendingSubmissions > 0 && <Badge variant="destructive">
                  {pendingSubmissions} Pending Submissions
                </Badge>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isClassCreator && <>
                <Button variant="outline" size="sm" onClick={() => setIsAssignStarOpen(true)} className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Assign Star
                </Button>

                <Button variant="outline" size="sm" onClick={handleRefreshTopStudents} disabled={isRefreshing} className="flex items-center gap-1">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Rankings
                </Button>

                <Button variant="outline" size="sm" onClick={onAddStudent} className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Add Students
                </Button>

                <Button variant="outline" size="sm" onClick={onAddAssistant} className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Add Assistant
                </Button>

                <Button variant="outline" size="sm" onClick={onManagePokemon} className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Manage Pokémon
                </Button>

                <Button variant="outline" size="sm" onClick={onViewSchoolPool} className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  School Pool
                </Button>

                <Button variant="destructive" size="sm" onClick={onDeleteClass} className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete Class
                </Button>
              </>}

            <Button onClick={onSwitchToHomework} className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Homework
              {pendingSubmissions > 0 && <Badge variant="secondary" className="ml-1">
                  {pendingSubmissions}
                </Badge>}
            </Button>
          </div>
        </div>
      </div>

      <AssignStarDialog isOpen={isAssignStarOpen} onOpenChange={setIsAssignStarOpen} classId={classData.id} students={students} currentStarStudentId={classData.star_student_id} onStarAssigned={() => {
      if (onStarAssigned) {
        onStarAssigned();
      }
    }} />
    </div>;
};
export default ClassManagementHeader;