import React, { useState, useEffect, useNavigate } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy, Users, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface StudentHeaderProps {
  studentName: string;
  coins: number;
  activeBattles: any[];
  onOpenSchoolPool: () => void;
}

interface ClassInfo {
  id: string;
  name: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({
  studentName,
  coins,
  activeBattles,
  onOpenSchoolPool
}) => {
  const { t } = useTranslation();
  const [classInfo, setClassInfo] = useState<ClassInfo[]>([]);
  const studentId = localStorage.getItem("studentId");
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) {
      loadClassInfo();
    }
  }, [studentId]);

  const loadClassInfo = async () => {
    try {
      // First try to get class info from student_profiles
      const { data: profileData } = await supabase
        .from("student_profiles")
        .select("class_id")
        .eq("user_id", studentId)
        .single();

      if (profileData?.class_id) {
        // Get class names from the classes table
        const { data: classData } = await supabase
          .from("classes")
          .select("id, name")
          .eq("id", profileData.class_id);

        if (classData && classData.length > 0) {
          setClassInfo(classData);
          return;
        }
      }

      // Fallback: try to get from students table
      const { data: studentData } = await supabase
        .from("students")
        .select("class_id")
        .eq("id", studentId)
        .single();

      if (studentData?.class_id) {
        const { data: classData } = await supabase
          .from("classes")
          .select("id, name")
          .eq("id", studentData.class_id);

        if (classData && classData.length > 0) {
          setClassInfo(classData);
        }
      }
    } catch (error) {
      console.error("Error loading class info:", error);
    }
  };

  const handleRankingsClick = () => {
    navigate("/student-ranking");
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t("hi")} {studentName}!
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold flex items-center gap-1">
                <Coins className="h-4 w-4" />
                {coins} {t("coins")}
              </Badge>
              
              {classInfo.length > 0 && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold">
                  📚 {classInfo[0].name}
                </Badge>
              )}
              
              {activeBattles.length > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold animate-pulse">
                  ⚔️ {activeBattles.length} Active Battle{activeBattles.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRankingsClick}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Rankings
            </Button>
            
            <Button
              onClick={onOpenSchoolPool}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("school-pool")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentHeader;
