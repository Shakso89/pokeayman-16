
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Users, Book, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import HomeworkTab from "./HomeworkTab";
import ClassmatesTab from "./ClassmatesTab";
import ClassRankingTab from "./ClassRankingTab";

interface MyClassesTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const MyClassesTab: React.FC<MyClassesTabProps> = ({ studentId, studentName, classId }) => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("classmates");
  
  useEffect(() => {
    loadClasses();
  }, [classId]);
  
  const loadClasses = () => {
    // In a real app, we would fetch from an API
    // For this demo, we'll use localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    // Filter classes for this student
    const studentClasses = allClasses.filter((cls: any) => 
      cls.id === classId || cls.students?.includes(studentId)
    );
    
    console.log("Found classes for student:", studentClasses);
    setClasses(studentClasses);
    
    // Auto-select the first class if none is selected
    if (studentClasses.length > 0 && !selectedClass) {
      setSelectedClass(studentClasses[0]);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("my-classes")}</h2>
      
      {classes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500">{t("no-classes-found")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Class List - Left Side */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t("classes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classes.map(cls => (
                    <Button
                      key={cls.id}
                      variant={selectedClass?.id === cls.id ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <span>{cls.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Class Details - Right Side */}
          <div className="md:col-span-3">
            {selectedClass ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedClass.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClass.description && (
                    <p className="text-sm text-gray-500 mb-6">{selectedClass.description}</p>
                  )}
                  
                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="classmates" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t("classmates")}
                      </TabsTrigger>
                      <TabsTrigger value="homework" className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        {t("homework")}
                      </TabsTrigger>
                      <TabsTrigger value="ranking" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        {t("ranking")}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="classmates">
                      <ClassmatesTab classId={selectedClass.id} />
                    </TabsContent>
                    
                    <TabsContent value="homework">
                      <HomeworkTab
                        studentId={studentId}
                        studentName={studentName}
                        classId={selectedClass.id}
                      />
                    </TabsContent>
                    
                    <TabsContent value="ranking">
                      <ClassRankingTab classId={selectedClass.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-500">{t("select-class")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClassesTab;
