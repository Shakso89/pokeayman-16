
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookText, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StudentsTable from "./StudentsTable";
import HomeworkManagement from "@/components/teacher/HomeworkManagement";

interface ClassTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  students: any[];
  isClassCreator: boolean;
  classData: any;
  teacherId: string;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onAddStudent: () => void;
}

const ClassTabs: React.FC<ClassTabsProps> = ({
  activeTab,
  onTabChange,
  students,
  isClassCreator,
  classData,
  teacherId,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onAddStudent,
}) => {
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  useEffect(() => {
    if (isClassCreator && classData?.id && teacherId) {
      loadPendingSubmissions();
      
      // Subscribe to submission changes for this specific class
      const channel = supabase
        .channel(`homework-submissions-class-${classData.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework_submissions' 
          },
          () => {
            console.log("Submission change detected for class, reloading pending count");
            loadPendingSubmissions();
          }
        )
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework' 
          },
          () => {
            console.log("Homework change detected for class, reloading pending count");
            loadPendingSubmissions();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isClassCreator, classData?.id, teacherId]);

  const loadPendingSubmissions = async () => {
    try {
      console.log("Loading pending submissions for class:", classData.id, "teacher:", teacherId);
      
      // Get homework assignments for this class created by this teacher
      const { data: homework, error: homeworkError } = await supabase
        .from('homework')
        .select('id')
        .eq('class_id', classData.id)
        .eq('teacher_id', teacherId);
        
      if (homeworkError) {
        console.error("Error loading homework:", homeworkError);
        setPendingSubmissions(0);
        return;
      }
      
      console.log("Found homework for this class:", homework);
      
      if (homework && homework.length > 0) {
        const homeworkIds = homework.map(hw => hw.id);
        
        // Get pending submissions for this class's homework
        const { data: submissions, error: submissionsError } = await supabase
          .from('homework_submissions')
          .select('id')
          .in('homework_id', homeworkIds)
          .eq('status', 'pending');
          
        if (submissionsError) {
          console.error("Error loading submissions:", submissionsError);
          setPendingSubmissions(0);
          return;
        }
        
        console.log("Found pending submissions for class:", submissions);
        setPendingSubmissions(submissions?.length || 0);
      } else {
        console.log("No homework found for this class");
        setPendingSubmissions(0);
      }
    } catch (error) {
      console.error("Error loading pending submissions:", error);
      setPendingSubmissions(0);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm">
        <TabsTrigger 
          value="students" 
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
        >
          Students
        </TabsTrigger>
        <TabsTrigger 
          value="homework"
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
        >
          Homework
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="students" className="mt-6">
        <div className="space-y-4">
          {/* Homework Management Quick Actions for Class Creator */}
          {isClassCreator && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Homework Management
                      </h3>
                      <p className="text-sm text-blue-700">Create and review homework for this class</p>
                    </div>
                    {pendingSubmissions > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">
                          {pendingSubmissions} pending review{pendingSubmissions > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onTabChange("homework")}
                      variant="outline"
                      className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <BookText className="h-4 w-4 mr-2" />
                      Manage Homework
                    </Button>
                    <Button 
                      onClick={() => onTabChange("homework")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Homework
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <StudentsTable
            students={students}
            isClassCreator={isClassCreator}
            onAwardCoins={onAwardCoins}
            onManagePokemon={onManagePokemon}
            onRemoveStudent={onRemoveStudent}
            onAddStudent={onAddStudent}
            classData={classData}
          />
        </div>
      </TabsContent>

      <TabsContent value="homework" className="mt-6">
        {isClassCreator ? (
          <HomeworkManagement 
            onBack={() => onTabChange("students")}
            teacherId={teacherId}
            classId={classData?.id}
          />
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-16 text-center">
              <BookText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Only</h3>
              <p className="text-gray-500">You don't have permission to manage homework for this class</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ClassTabs;
