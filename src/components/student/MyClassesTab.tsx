
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentHomeworkTab from "./StudentHomeworkTab";
import ClassRankingTab from "./ClassRankingTab";

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

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = () => {
    try {
      // Load class data from localStorage
      const savedClasses = localStorage.getItem("classes");
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const currentClass = classes.find((cls: any) => cls.id === classId);
        if (currentClass) {
          setClassData(currentClass);
        }
      }
    } catch (error) {
      console.error("Error loading class data:", error);
    }
  };

  if (!classData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No class found</p>
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
            classId={classId}
          />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <ClassRankingTab classId={classId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyClassesTab;
