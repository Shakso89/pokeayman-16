import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentHomeworkTab from "./StudentHomeworkTab";
import ClassRankingTab from "./ClassRankingTab";
import { getStudentClasses } from "@/services/studentDatabase";

interface MyClassesTabProps {
  studentId: string;
  studentName: string;
}

const MyClassesTab: React.FC<MyClassesTabProps> = ({
  studentId,
  studentName,
}) => {
  const { t } = useTranslation();
  const [classesData, setClassesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    loadClassesData();
  }, [studentId]);

  const loadClassesData = async () => {
    if (!studentId) {
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const assignments = await getStudentClasses(studentId);
      
      const studentClasses = assignments.map((assignment: any) => assignment.classes).filter(Boolean);

      setClassesData(studentClasses);
      if (studentClasses.length > 0) {
        if (!selectedClassId || !studentClasses.some(c => c.id === selectedClassId)) {
          setSelectedClassId(studentClasses[0].id);
        }
      } else {
        setSelectedClassId(null);
      }
    } catch (error) {
      console.error("Error loading classes data:", error);
      setClassesData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading classes...</p>
        </CardContent>
      </Card>
    );
  }

  if (classesData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No classes found</p>
          <p className="text-sm text-gray-400 mt-2">
            Please contact your teacher to be added to a class.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentClass = classesData.find(cls => cls.id === selectedClassId) || classesData[0];

  return (
    <div className="space-y-6">
      {/* Class Selection (if multiple classes) */}
      {classesData.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Select Class:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {classesData.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedClassId === cls.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-sm opacity-75">{cls.description || 'No description'}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Class Header */}
      {currentClass && (
        <>
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">{currentClass.name}</h2>
              <p className="text-blue-100">
                {currentClass.description || "Welcome to your class!"}
              </p>
              {classesData.length > 1 && (
                <p className="text-sm text-blue-200 mt-2">
                  You are enrolled in {classesData.length} classes
                </p>
              )}
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
                classId={currentClass.id}
              />
            </TabsContent>

            <TabsContent value="ranking" className="mt-6">
              <ClassRankingTab classId={currentClass.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MyClassesTab;
