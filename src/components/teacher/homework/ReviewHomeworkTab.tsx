
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PendingSubmissionsList } from "./review-components/PendingSubmissionsList";
import { SubmissionReviewPanel } from "./review-components/SubmissionReviewPanel";
import { supabase } from "@/integrations/supabase/client";

interface ReviewHomeworkTabProps {
  activeHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: { id: string, name: string }[];
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission, feedback: string) => void;
}

const ReviewHomeworkTab: React.FC<ReviewHomeworkTabProps> = ({
  activeHomework,
  submissions,
  classes,
  onApproveSubmission,
  onRejectSubmission
}) => {
  const { t } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState<HomeworkSubmission[]>(submissions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update local submissions when props change
  useEffect(() => {
    console.log("ReviewHomeworkTab - Submissions updated:", submissions.length);
    setLocalSubmissions(submissions);
  }, [submissions]);

  // Set up real-time subscription for homework submissions
  useEffect(() => {
    console.log("Setting up realtime subscription for homework submissions");
    
    const channel = supabase
      .channel('homework-submissions-review')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'homework_submissions' 
        },
        async (payload) => {
          console.log("Real-time submission change detected:", payload);
          // Force refresh of submissions
          await refreshSubmissions();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      console.log("Manually refreshing submissions for teacher:", teacherId);
      
      // Get all homework for this teacher
      const { data: homeworkData, error: hwError } = await supabase
        .from('homework')
        .select('id')
        .eq('teacher_id', teacherId);
        
      if (hwError) {
        console.error("Error loading homework:", hwError);
        return;
      }
      
      if (!homeworkData || homeworkData.length === 0) {
        console.log("No homework found for teacher");
        setLocalSubmissions([]);
        return;
      }
      
      const homeworkIds = homeworkData.map(hw => hw.id);
      
      // Get all submissions for this teacher's homework
      const { data: submissionsData, error: subError } = await supabase
        .from('homework_submissions')
        .select('*')
        .in('homework_id', homeworkIds)
        .order('submitted_at', { ascending: false });
        
      if (subError) {
        console.error("Error loading submissions:", subError);
        return;
      }
      
      console.log("Refreshed submissions:", submissionsData);
      
      const mappedSubmissions = submissionsData?.map(sub => ({
        id: sub.id,
        homeworkId: sub.homework_id,
        studentId: sub.student_id,
        studentName: sub.student_name,
        content: sub.content,
        type: sub.type as "text" | "image" | "audio" | "multiple_choice",
        submittedAt: sub.submitted_at,
        status: sub.status as "pending" | "approved" | "rejected",
        feedback: sub.feedback,
        answers: sub.answers ? JSON.parse(sub.answers) : undefined
      })) || [];
      
      setLocalSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Error refreshing submissions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = localSubmissions.find(s => s.id === submissionId);
    if (!submission) return null;
    
    const homework = activeHomework.find(hw => hw.id === submission.homeworkId);
    return homework;
  };

  const pendingSubmissions = localSubmissions.filter(s => s.status === "pending");
  
  console.log("ReviewHomeworkTab - Active homework:", activeHomework.length);
  console.log("ReviewHomeworkTab - Local submissions:", localSubmissions.length);
  console.log("ReviewHomeworkTab - Pending submissions:", pendingSubmissions.length);

  const handleApprove = (submission: HomeworkSubmission) => {
    console.log("Approving submission:", submission.id);
    onApproveSubmission(submission);
    setSelectedSubmission(null);
  };

  const handleReject = (submission: HomeworkSubmission, feedback: string) => {
    console.log("Rejecting submission:", submission.id, "with feedback:", feedback);
    onRejectSubmission(submission, feedback);
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("review-homework-submissions")}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSubmissions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="secondary" className={pendingSubmissions.length > 0 ? "bg-orange-100 text-orange-800" : ""}>
            {pendingSubmissions.length} pending reviews
          </Badge>
          <Badge variant="outline">
            {localSubmissions.length} total submissions
          </Badge>
        </div>
      </div>

      {pendingSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">{t("no-pending-submissions")}</p>
            <div className="text-sm text-gray-400 mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Debug Information:</p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p>📚 Active homework: {activeHomework.length}</p>
                  <p>🎯 Total submissions: {localSubmissions.length}</p>
                  <p>⏳ Pending submissions: {pendingSubmissions.length}</p>
                </div>
                <div>
                  <p>🏫 Classes: {classes.length}</p>
                  <p>📊 Submission statuses:</p>
                  <div className="ml-2">
                    {localSubmissions.length === 0 ? (
                      <p>• No submissions found</p>
                    ) : (
                      Object.entries(
                        localSubmissions.reduce((acc, sub) => {
                          acc[sub.status] = (acc[sub.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, count]) => (
                        <p key={status}>• {status}: {count}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {localSubmissions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="font-medium mb-1">Recent submissions:</p>
                  {localSubmissions.slice(0, 3).map(sub => (
                    <p key={sub.id} className="text-xs">
                      • {sub.studentName} - {sub.status} ({new Date(sub.submittedAt).toLocaleDateString()})
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <PendingSubmissionsList
            pendingSubmissions={pendingSubmissions}
            activeHomework={activeHomework}
            classes={classes}
            selectedSubmission={selectedSubmission}
            onSelectSubmission={setSelectedSubmission}
          />

          {/* Submission Review Panel */}
          <SubmissionReviewPanel
            selectedSubmission={selectedSubmission}
            homework={selectedSubmission ? getHomeworkForSubmission(selectedSubmission.id) : null}
            onApproveSubmission={handleApprove}
            onRejectSubmission={handleReject}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewHomeworkTab;
