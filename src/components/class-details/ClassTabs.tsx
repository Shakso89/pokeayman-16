
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookText, Plus, FileText, ClipboardList, PenTool, Eye } from "lucide-react";
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

  const handleRemoveCoins = (studentId: string, studentName: string) => {
    // TODO: Implement remove coins functionality
    console.log("Remove coins for student:", studentName);
  };

  const handleRemovePokemon = (studentId: string, studentName: string) => {
    // TODO: Implement remove pokemon functionality
    console.log("Remove pokemon for student:", studentName);
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
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium relative"
        >
          Homework
          {pendingSubmissions > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {pendingSubmissions}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="students" className="mt-6">
        <div className="space-y-4">
          {/* Enhanced Homework Management Quick Actions for Class Creator */}
          {isClassCreator && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        Class Homework Management
                      </h3>
                      <p className="text-sm text-blue-700 mb-2">
                        Create assignments and review submissions for {classData?.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600">
                          📚 Students: {students.length}
                        </span>
                        {pendingSubmissions > 0 && (
                          <span className="text-orange-600 font-medium animate-pulse">
                            ⏰ {pendingSubmissions} pending review{pendingSubmissions > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => onTabChange("homework")}
                      variant="outline"
                      className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <PenTool className="h-4 w-4" />
                      Post Homework
                    </Button>
                    <Button 
                      onClick={() => onTabChange("homework")}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review Homework
                      {pendingSubmissions > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {pendingSubmissions}
                        </Badge>
                      )}
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
            onRemoveCoins={handleRemoveCoins}
            onRemovePokemon={handleRemovePokemon}
          />
        </div>
      </TabsContent>

      <TabsContent value="homework" className="mt-6">
        {isClassCreator ? (
          <div className="space-y-4">
            {/* Class context header */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">
                      📚 {classData?.name} - Homework Management
                    </h3>
                    <p className="text-sm text-indigo-700">
                      Manage assignments and review submissions for this class
                    </p>
                  </div>
                  <Button 
                    onClick={() => onTabChange("students")}
                    variant="outline"
                    size="sm"
                    className="text-indigo-700 border-indigo-300"
                  >
                    ← Back to Students
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <HomeworkManagement 
              onBack={() => onTabChange("students")}
              teacherId={teacherId}
              classId={classData?.id}
            />
          </div>
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
