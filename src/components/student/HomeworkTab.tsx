
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
import { motion } from "framer-motion";

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
        (payload) => {
          // Only refresh if the homework is for this class
          if (payload.new && typeof payload.new === 'object' && 'classId' in payload.new && payload.new.classId === classId) {
            loadHomeworkData();
          }
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
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new && payload.new.status === 'approved') {
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
    if (!classId) {
      console.error("No classId provided to HomeworkTab");
      setHomeworkAssignments([]);
      setUserSubmissions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log(`Loading homework data for class: ${classId} and student: ${studentId}`);

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
      
      if (homeworkData) {
        console.log(`Found ${homeworkData.length} homework assignments for class ${classId}`);
        setHomeworkAssignments(homeworkData);
      } else {
        console.log("No homework found in Supabase, checking localStorage");
        throw new Error("No homework found in database");
      }
      
      if (submissionsData) {
        console.log(`Found ${submissionsData.length} homework submissions for student ${studentId}`);
        setUserSubmissions(submissionsData);
      } else {
        console.log("No submissions found in Supabase, checking localStorage");
        throw new Error("No submissions found in database");
      }
    } catch (error) {
      console.error("Error loading from Supabase, falling back to localStorage:", error);
      
      // Fallback to localStorage
      try {
        const savedHomework = localStorage.getItem("homeworkAssignments");
        const savedSubmissions = localStorage.getItem("homeworkSubmissions");
        
        if (savedHomework) {
          const allHomework = JSON.parse(savedHomework);
          // IMPORTANT: Filter to only show homework for this specific class
          const classHomework = allHomework.filter(
            (hw: any) => hw.classId === classId
          );
          console.log(`Found ${classHomework.length} homework assignments for class ${classId} in localStorage`);
          setHomeworkAssignments(classHomework);
        } else {
          setHomeworkAssignments([]);
        }
        
        if (savedSubmissions) {
          const allSubmissions = JSON.parse(savedSubmissions);
          const userSubs = allSubmissions.filter(
            (sub: any) => sub.studentId === studentId
          );
          console.log(`Found ${userSubs.length} homework submissions for student ${studentId} in localStorage`);
          setUserSubmissions(userSubs);
        } else {
          setUserSubmissions([]);
        }
      } catch (localError) {
        console.error("Error with localStorage fallback:", localError);
        
        toast({
          title: t("error"),
          description: t("failed-to-load-homework"),
          variant: "destructive"
        });
        
        setHomeworkAssignments([]);
        setUserSubmissions([]);
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
    } else {
      // Handle case where no submission is found
      setSelectedSubmission(null);
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="pt-6">
          <motion.h3 
            className="text-lg font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t("homework")}
          </motion.h3>
          
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
    </motion.div>
  );
};

export default HomeworkTab;
