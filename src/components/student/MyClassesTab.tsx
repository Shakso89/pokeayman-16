
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentHomeworkTab from "./StudentHomeworkTab";
import ClassRankingTab from "./ClassRankingTab";
import { supabase } from "@/integrations/supabase/client";

interface MyClassesTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const MyClassesTab: React.FC<MyClassesTabProps> = ({
  studentId,
  studentName,
  classId
}) => {
  const { t } = useTranslation();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassData();
  }, [classId, studentId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      console.log("Loading class data for classId:", classId, "studentId:", studentId);
      
      // First try to load from Supabase
      if (classId && classId !== "") {
        const { data: classFromDB, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();
          
        if (classFromDB && !error) {
          console.log("Found class in Supabase:", classFromDB);
          setClassData(classFromDB);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to localStorage
      const savedClasses = localStorage.getItem("classes");
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        let currentClass = null;
        
        if (classId && classId !== "") {
          currentClass = classes.find((cls: any) => cls.id === classId);
        }
        
        // If no class found by classId, try to find by student membership
        if (!currentClass) {
          currentClass = classes.find((cls: any) => 
            cls.students && cls.students.includes(studentId)
          );
          
          // Update localStorage with correct classId if found
          if (currentClass) {
            localStorage.setItem("studentClassId", currentClass.id);
          }
        }
        
        if (currentClass) {
          console.log("Found class in localStorage:", currentClass);
          setClassData(currentClass);
        } else {
          console.log("No class found for student");
          setClassData(null);
        }
      }
    } catch (error) {
      console.error("Error loading class data:", error);
      setClassData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading class...</p>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No class found</p>
          <p className="text-sm text-gray-400 mt-2">
            Please contact your teacher to be added to a class.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">{classData.name}</h2>
          <p className="text-blue-100">
            {classData.description || "Welcome to your class!"}
          </p>
        </CardContent>
      </Card>

      {/* Class Tabs */}
      <Tabs defaultValue="homework" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="homework">📚 Homework</TabsTrigger>
          <TabsTrigger value="ranking">🏆 Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="homework" className="mt-6">
          <StudentHomeworkTab
            studentId={studentId}
            studentName={studentName}
            classId={classData.id}
          />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <ClassRankingTab classId={classData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyClassesTab;
