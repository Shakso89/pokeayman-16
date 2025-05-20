
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HomeworkAssignment } from "@/types/homework";
import { toast } from "@/hooks/use-toast";
import SubmitHomeworkDialog from "./homework/SubmitHomeworkDialog";
import ViewSubmissionDialog from "./homework/ViewSubmissionDialog";
import HomeworkList from "./homework/HomeworkList";
import { fetchHomeworkForClass, fetchStudentSubmissions } from "./homework/utils";

interface HomeworkTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({
  studentId,
  studentName,
  classId
}) => {
  const { t } = useTranslation();
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkAssignment | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isViewSubmissionOpen, setIsViewSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (classId) {
      loadHomeworkData();
    }
    
    // Listen for homework changes
    const channel = supabase
      .channel('homework_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'homework' 
        },
        () => {
          loadHomeworkData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, studentId]);

  const loadHomeworkData = async () => {
    setIsLoading(true);
    try {
      // Fetch homework assignments for the class
      const classHomework = await fetchHomeworkForClass(classId);
      setHomeworkAssignments(classHomework);
      
      // Fetch student submissions
      const submissions = await fetchStudentSubmissions(studentId);
      setUserSubmissions(submissions);
    } catch (error) {
      console.error("Error loading homework:", error);
      // Fallback to localStorage or display error
      toast({
        title: t("error"),
        description: t("failed-to-load-homework"),
        variant: "destructive"
      });
      
      // Try localStorage fallback
      try {
        const savedHomework = localStorage.getItem("homeworkAssignments");
        const savedSubmissions = localStorage.getItem("homeworkSubmissions");
        
        if (savedHomework) {
          const allHomework = JSON.parse(savedHomework);
          const classHomework = allHomework.filter(
            (hw: any) => hw.classId === classId
          );
          setHomeworkAssignments(classHomework);
        }
        
        if (savedSubmissions) {
          const allSubmissions = JSON.parse(savedSubmissions);
          const userSubs = allSubmissions.filter(
            (sub: any) => sub.studentId === studentId
          );
          setUserSubmissions(userSubs);
        }
      } catch (localError) {
        console.error("Error with localStorage fallback:", localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitHomework = (homework: HomeworkAssignment) => {
    setSelectedHomework(homework);
    setIsSubmitDialogOpen(true);
  };

  const handleViewSubmission = (homework: HomeworkAssignment) => {
    setSelectedHomework(homework);
    
    // Find the submission for this homework
    const submission = userSubmissions.find(sub => sub.homeworkId === homework.id);
    if (submission) {
      setSelectedSubmission(submission);
      setIsViewSubmissionOpen(true);
    }
  };

  const handleSubmissionComplete = () => {
    setIsSubmitDialogOpen(false);
    loadHomeworkData(); // Refresh data to show new submission
    toast({
      title: t("success"),
      description: t("homework-submitted-successfully")
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>{t("loading-homework")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">{t("homework")}</h3>
        
        <HomeworkList 
          homework={homeworkAssignments}
          userSubmissions={userSubmissions}
          onSubmit={handleSubmitHomework}
          onView={handleViewSubmission}
          t={t}
        />
        
        {selectedHomework && (
          <>
            <SubmitHomeworkDialog
              open={isSubmitDialogOpen}
              onOpenChange={setIsSubmitDialogOpen}
              homework={selectedHomework}
              studentId={studentId}
              studentName={studentName}
              onSubmissionComplete={handleSubmissionComplete}
            />
            
            <ViewSubmissionDialog
              open={isViewSubmissionOpen}
              onOpenChange={setIsViewSubmissionOpen}
              homework={selectedHomework}
              submission={selectedSubmission}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkTab;
