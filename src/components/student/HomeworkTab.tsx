
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
    
    // Listen for homework changes and submission status changes
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
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'homework_submissions',
          filter: `studentId=eq.${studentId}`
        },
        (payload) => {
          // If a submission is approved, show toast notification
          if (payload.new && payload.new.status === 'approved') {
            toast({
              title: t("submission-approved"),
              description: t("you-earned-coins")
            });
          }
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
      // Try to fetch from Supabase first
      const { data: homeworkData, error: homeworkError } = await supabase
        .from('homework')
        .select('*')
        .eq('classId', classId);
        
      if (homeworkError) throw homeworkError;
      
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('studentId', studentId);
        
      if (submissionsError) throw submissionsError;
      
      setHomeworkAssignments(homeworkData || []);
      setUserSubmissions(submissionsData || []);
    } catch (error) {
      console.error("Error loading from Supabase, falling back to localStorage:", error);
      
      // Fallback to localStorage
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
        
        toast({
          title: t("error"),
          description: t("failed-to-load-homework"),
          variant: "destructive"
        });
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

  const handleSubmissionComplete = async (submissionData: any) => {
    try {
      // Try to save to Supabase first
      const { error } = await supabase
        .from('homework_submissions')
        .insert([submissionData]);
        
      if (error) throw error;
      
      setUserSubmissions(prev => [...prev, submissionData]);
      setIsSubmitDialogOpen(false);
      
      toast({
        title: t("success"),
        description: t("homework-submitted-successfully")
      });
    } catch (error) {
      console.error("Error saving to Supabase, falling back to localStorage:", error);
      
      // Fallback to localStorage
      const currentSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
      localStorage.setItem("homeworkSubmissions", JSON.stringify([...currentSubmissions, submissionData]));
      
      setUserSubmissions(prev => [...prev, submissionData]);
      setIsSubmitDialogOpen(false);
      
      toast({
        title: t("success"),
        description: t("homework-submitted-successfully")
      });
    }
  };
  
  // Filter out expired homework
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);

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
          homeworks={activeHomework}
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
