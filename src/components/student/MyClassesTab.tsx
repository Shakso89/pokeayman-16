
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
  const [classesData, setClassesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(classId);

  useEffect(() => {
    loadClassesData();
  }, [classId, studentId]);

  const loadClassesData = async () => {
    try {
      setLoading(true);
      console.log("Loading classes data for classId:", classId, "studentId:", studentId);
      
      // Parse multiple class IDs if they exist (comma-separated)
      const classIds = classId ? classId.split(',').filter(id => id.trim()) : [];
      
      let studentClasses: any[] = [];
      
      // First try to load from Supabase
      if (classIds.length > 0) {
        const { data: classesFromDB, error } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);
          
        if (classesFromDB && !error) {
          console.log("Found classes in Supabase:", classesFromDB);
          studentClasses = classesFromDB;
        }
      }
      
      // Fallback to localStorage
      if (studentClasses.length === 0) {
        const savedClasses = localStorage.getItem("classes");
        if (savedClasses) {
          const classes = JSON.parse(savedClasses);
          
          if (classIds.length > 0) {
            studentClasses = classes.filter((cls: any) => classIds.includes(cls.id));
          } else {
            // Try to find by student membership
            studentClasses = classes.filter((cls: any) => 
              cls.students && cls.students.includes(studentId)
            );
          }
        }
      }
      
      setClassesData(studentClasses);
      if (studentClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(studentClasses[0].id);
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
            classId={selectedClassId}
          />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <ClassRankingTab classId={selectedClassId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyClassesTab;
