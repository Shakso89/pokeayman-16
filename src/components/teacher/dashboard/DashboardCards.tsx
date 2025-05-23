
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartIcon, BookText, Users, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DashboardCardsProps {
  teacherId: string;
  onManageClasses: () => void;
  isAdmin: boolean;
  onNavigateToClass?: (classId: string) => void; // Add this optional prop
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ 
  teacherId, 
  onManageClasses, 
  isAdmin,
  onNavigateToClass  // Accept the new prop
}) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    studentCount: 0,
    classCount: 0,
    homeworkCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);

  useEffect(() => {
    loadTeacherStats();
    loadRecentClasses();
  }, [teacherId]);

  const loadTeacherStats = async () => {
    setLoading(true);
    try {
      if (!teacherId) return;
      
      // Attempt to load stats from Supabase
      let studentCount = 0;
      let classCount = 0;
      let homeworkCount = 0;
      
      try {
        // Get student count
        const { count: sCount, error: sError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherId);
          
        if (!sError) studentCount = sCount || 0;
        
        // Get class count
        const { count: cCount, error: cError } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherId);
          
        if (!cError) classCount = cCount || 0;
        
      } catch (error) {
        console.error("Error fetching stats from Supabase:", error);
      }
      
      // Update the stats
      setStats({
        studentCount,
        classCount,
        homeworkCount
      });
      
    } catch (error) {
      console.error("Failed to load teacher stats:", error);
      toast({
        title: t("error"),
        description: t("failed-to-load-stats"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadRecentClasses = async () => {
    try {
      if (!teacherId) return;
      
      // Try to load from Supabase first
      let classes;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (!error && data) {
          classes = data;
        }
      } catch (error) {
        console.error("Error fetching classes from Supabase:", error);
      }
      
      // If we couldn't get them from Supabase, try localStorage
      if (!classes) {
        const storedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
        classes = storedClasses
          .filter((c: any) => c.teacherId === teacherId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
      }
      
      setRecentClasses(classes || []);
      
    } catch (error) {
      console.error("Failed to load recent classes:", error);
    }
  };

  // Handler for when a class card is clicked
  const handleClassClick = (classId: string) => {
    if (onNavigateToClass) {
      onNavigateToClass(classId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Student Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              {t("students")}
            </CardTitle>
            <CardDescription>{t("manage-your-students")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{loading ? "..." : stats.studentCount}</div>
            <p className="text-sm text-blue-600">{t("total-students")}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Classes Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="h-5 w-5 mr-2 text-green-500" />
              {t("classes")}
            </CardTitle>
            <CardDescription>{t("manage-your-classes")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{loading ? "..." : stats.classCount}</div>
            <p className="text-sm text-green-600">{t("total-classes")}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full text-green-700 hover:text-green-800 hover:bg-green-100"
              onClick={onManageClasses}
            >
              {t("manage-classes")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Homework Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BookText className="h-5 w-5 mr-2 text-purple-500" />
              {t("homework")}
            </CardTitle>
            <CardDescription>{t("homework-assignments")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{loading ? "..." : stats.homeworkCount}</div>
            <p className="text-sm text-purple-600">{t("total-homework-assigned")}</p>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Recent Classes List */}
      <motion.div 
        className="col-span-1 md:col-span-2 lg:col-span-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("recent-classes")}</CardTitle>
            <CardDescription>{t("your-most-recent-classes")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClasses.length > 0 ? (
                recentClasses.map((cls) => (
                  <motion.div 
                    key={cls.id}
                    className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleClassClick(cls.id)}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-xs text-gray-500">
                          {cls.students?.length || 0} {t("students")}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClassClick(cls.id);
                        }}
                      >
                        {t("view")}
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {t("no-classes-yet")}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onManageClasses}
            >
              {t("view-all-classes")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {isAdmin && (
        <motion.div 
          className="col-span-1 md:col-span-2 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChartIcon className="h-5 w-5 mr-2 text-amber-500" />
                {t("admin-analytics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("admin-analytics-description")}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">{t("view-analytics")}</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardCards;
