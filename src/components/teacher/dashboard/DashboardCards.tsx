import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { School, MessageSquare, BarChart, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
interface DashboardCardsProps {
  onManageClasses: () => void;
  isAdmin?: boolean;
  teacherId?: string;
  onNavigateToClass?: (classId: string) => void;
}
interface ClassData {
  id: string;
  name: string;
  description?: string;
  students: string[];
}
const DashboardCards: React.FC<DashboardCardsProps> = ({
  onManageClasses,
  isAdmin = false,
  teacherId,
  onNavigateToClass
}) => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [myClasses, setMyClasses] = useState<ClassData[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  useEffect(() => {
    if (teacherId) {
      loadTeacherClasses();
    }
  }, [teacherId]);
  const loadTeacherClasses = async () => {
    if (!teacherId) return;
    setIsLoadingClasses(true);
    try {
      const {
        data,
        error
      } = await supabase.from('classes').select('*').eq('teacher_id', teacherId).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error("Error loading teacher classes:", error);
        return;
      }
      console.log("Loaded teacher classes:", data);
      setMyClasses(data || []);
    } catch (error) {
      console.error("Error loading teacher classes:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };
  const handleClassClick = (classId: string) => {
    console.log("Navigating to class:", classId);
    // Fix: Use the correct route that matches App.tsx
    navigate(`/class-details/${classId}`);
  };
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* My Classes Card */}
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            My Classes
          </CardTitle>
          <CardDescription>
            Quick access to your active classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClasses ? <p className="text-gray-500">Loading classes...</p> : myClasses.length > 0 ? <div className="space-y-2 max-h-32 overflow-y-auto">
              {myClasses.slice(0, 3).map(classItem => <div key={classItem.id} className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleClassClick(classItem.id)}>
                  <p className="font-medium text-sm">{classItem.name}</p>
                  <p className="text-xs text-gray-500">
                    {classItem.students?.length || 0} students
                  </p>
                </div>)}
              {myClasses.length > 3 && <p className="text-xs text-gray-500">
                  +{myClasses.length - 3} more classes
                </p>}
            </div> : <p className="text-gray-500">No classes yet</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full pokemon-button" onClick={onManageClasses}>
            View All Classes
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6 text-blue-500" />
            {t("manage-classes")}
          </CardTitle>
          <CardDescription>
            {isAdmin ? t("manage-schools-classes") : t("manage-classes-desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {isAdmin ? t("admin-manage-classes-details") : t("manage-classes-details")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full pokemon-button" onClick={onManageClasses}>
            {t("manage-classes")}
          </Button>
        </CardFooter>
      </Card>

      
      
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-purple-500" />
            {t("reports-analytics")}
          </CardTitle>
          <CardDescription>
            {t("student-participation")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {t("student-engagement")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full pokemon-button" onClick={() => navigate("/teacher/reports")}>
            {t("reports-analytics")}
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default DashboardCards;