
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Users, Book, Trophy, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import HomeworkTab from "./HomeworkTab";
import StudentsTab from "./StudentsTab";
import ClassRankingTab from "./ClassRankingTab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [classes, setClasses] = useState<Array<{
    id: string;
    name: string;
    description?: string;
  }>>([]);
  const [selectedClass, setSelectedClass] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("students");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClasses();

    // Subscribe to class changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'classes'
        },
        (payload) => {
          console.log('Class change detected:', payload);
          loadClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      // First try to load from database - get all classes that include the student ID
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, description')
        .contains('students', [studentId]);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setClasses(data);
        
        // Auto-select the class with matching classId or first class
        const targetClass = data.find(cls => cls.id === classId) || data[0];
        setSelectedClass(targetClass);
      } else {
        // Fallback to localStorage if no classes found in database
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const studentClasses = allClasses.filter((cls: any) => cls.id === classId || cls.students?.includes(studentId));
        
        console.log("Found classes for student in localStorage:", studentClasses);
        setClasses(studentClasses);

        if (studentClasses.length > 0) {
          const targetClass = studentClasses.find((cls: any) => cls.id === classId) || studentClasses[0];
          setSelectedClass(targetClass);
        }
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        title: t("error"),
        description: t("error-loading-classes"),
        variant: "destructive"
      });
      
      // Fallback to localStorage on error
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const studentClasses = allClasses.filter((cls: any) => cls.id === classId || cls.students?.includes(studentId));
      setClasses(studentClasses);
      
      if (studentClasses.length > 0) {
        const targetClass = studentClasses.find((cls: any) => cls.id === classId) || studentClasses[0];
        setSelectedClass(targetClass);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>{t("loading-classes")}</p>
        </div>
      </div>
    );
  }

  return <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("my-classes")}</h2>
      
      {classes.length === 0 ? <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500">{t("no-classes-found")}</p>
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Class List - Left Side */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t("classes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classes.map(cls => <Button key={cls.id} variant={selectedClass?.id === cls.id ? "default" : "outline"} className="w-full justify-between" onClick={() => setSelectedClass(cls)}>
                      <span>{cls.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Class Details - Right Side */}
          <div className="md:col-span-3">
            {selectedClass ? <Card>
                <CardHeader>
                  <CardTitle>{selectedClass.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClass.description && <p className="text-sm text-gray-500 mb-6">{selectedClass.description}</p>}
                  
                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t("students")}
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
                    
                    <TabsContent value="students">
                      <StudentsTab classId={selectedClass.id} />
                    </TabsContent>
                    
                    <TabsContent value="homework">
                      <HomeworkTab studentId={studentId} studentName={studentName} classId={selectedClass.id} />
                    </TabsContent>
                    
                    <TabsContent value="ranking">
                      <ClassRankingTab classId={selectedClass.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card> : <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-500">{t("select-class")}</p>
                </CardContent>
              </Card>}
          </div>
        </div>}
    </div>;
};

export default MyClassesTab;
