import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HomeworkList from "@/components/homework/HomeworkList";

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

  if (activeTab === "homework") {
    return (
      <div className="space-y-6">
        {/* Back to Students Button */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => onTabChange("students")}
            variant="outline"
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Students
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            📚 Homework Management
          </Badge>
        </div>
        
        {/* Homework Management Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                📚 {classData?.name} - Homework Center
              </h2>
              <p className="text-green-700 mb-4">
                Create assignments, review submissions, and manage homework for this class
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-blue-600 font-medium">
                  👥 {students.length} Students
                </span>
                {pendingSubmissions > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    ⏰ {pendingSubmissions} Pending Reviews
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Homework List Component */}
        <HomeworkList 
          classId={classData?.id}
          teacherId={teacherId}
          isTeacher={isClassCreator}
        />
      </div>
    );
  }

  // This should not render anything for students tab as it's handled in ClassDetails
  return null;
};

export default ClassTabs;
