
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
  classes: { id: string; name: string }[];
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission, feedback: string) => void;
}

const ReviewHomeworkTab: React.FC<ReviewHomeworkTabProps> = ({
  activeHomework,
  submissions,
  classes,
  onApproveSubmission,
  onRejectSubmission,
}) => {
  const { t } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const teacherId = localStorage.getItem("teacherId");

  // Load submissions directly from database
  const loadSubmissions = async () => {
    if (!teacherId) return;
    
    setIsRefreshing(true);
    try {
      console.log("Loading submissions for teacher:", teacherId);
      
      // Get all homework IDs for this teacher
      const { data: homeworkData, error: hwError } = await supabase
        .from("homework")
        .select("id")
        .eq("teacher_id", teacherId);

      if (hwError) {
        console.error("Error loading homework:", hwError);
        setLocalSubmissions([]);
        return;
      }

      console.log("Found homework for teacher:", homeworkData);

      if (!homeworkData || homeworkData.length === 0) {
        console.log("No homework found for teacher");
        setLocalSubmissions([]);
        return;
      }

      const homeworkIds = homeworkData.map((h) => h.id);
      
      // Get all submissions for this teacher's homework
      const { data: submissionsData, error: subError } = await supabase
        .from("homework_submissions")
        .select("*")
        .in("homework_id", homeworkIds)
        .order("submitted_at", { ascending: false });

      if (subError) {
        console.error("Error loading submissions:", subError);
        setLocalSubmissions([]);
        return;
      }

      console.log("Found submissions:", submissionsData);

      // Map to our interface format
      const mappedSubmissions = submissionsData?.map((s) => ({
        id: s.id,
        homeworkId: s.homework_id,
        studentId: s.student_id,
        studentName: s.student_name,
        content: s.content,
        type: s.type as "text" | "image" | "audio" | "multiple_choice",
        submittedAt: s.submitted_at,
        status: s.status as "pending" | "approved" | "rejected",
        feedback: s.feedback,
        answers: s.answers ? JSON.parse(s.answers) : undefined,
      })) || [];

      console.log("Mapped submissions:", mappedSubmissions);
      console.log("Pending submissions:", mappedSubmissions.filter(s => s.status === 'pending'));
      
      setLocalSubmissions(mappedSubmissions);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setLocalSubmissions([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Load submissions on mount
  useEffect(() => {
    loadSubmissions();
  }, [teacherId]);

  // Set up real-time subscription for new submissions
  useEffect(() => {
    if (!teacherId) return;

    console.log("Setting up realtime subscription for homework submissions");
    
    const channel = supabase
      .channel("homework-submissions-review")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "homework_submissions",
      }, (payload) => {
        console.log("Realtime submission change:", payload);
        // Reload submissions when there's any change
        loadSubmissions();
      })
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  const pending = localSubmissions.filter((s) => s.status === "pending");
  const getHomework = (id: string) => activeHomework.find((hw) => hw.id === id) || null;

  const handleApprove = (sub: HomeworkSubmission) => {
    onApproveSubmission(sub);
    setSelectedSubmission(null);
    // Reload submissions after approval
    setTimeout(loadSubmissions, 500);
  };

  const handleReject = (sub: HomeworkSubmission, feedback: string) => {
    onRejectSubmission(sub, feedback);
    setSelectedSubmission(null);
    // Reload submissions after rejection
    setTimeout(loadSubmissions, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("review-homework-submissions")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSubmissions} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Badge variant="secondary" className={pending.length > 0 ? "bg-orange-100 text-orange-800" : ""}>
            {pending.length} pending reviews
          </Badge>
          <Badge variant="outline">{localSubmissions.length} total submissions</Badge>
        </div>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-500">
            {localSubmissions.length === 0 ? "No homework submissions found" : "No pending submissions to review"}
            <div className="mt-4 text-gray-400 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Debug Info:</p>
              <div className="grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <p>📚 Homework: {activeHomework.length}</p>
                  <p>🎯 Submissions: {localSubmissions.length}</p>
                  <p>⏳ Pending: {pending.length}</p>
                </div>
                <div>
                  <p>🏫 Classes: {classes.length}</p>
                  <p>📊 Status:</p>
                  <div className="ml-2">
                    {Object.entries(
                      localSubmissions.reduce((acc, s) => {
                        acc[s.status] = (acc[s.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <p key={status}>• {status}: {count}</p>
                    ))}
                  </div>
                </div>
              </div>
              {localSubmissions.length > 0 && (
                <div className="pt-2 border-t border-gray-200 mt-3">
                  <p className="font-medium mb-1">Recent:</p>
                  {localSubmissions.slice(0, 3).map((s) => (
                    <p key={s.id} className="text-xs">• {s.studentName} - {s.status} ({new Date(s.submittedAt).toLocaleDateString()})</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingSubmissionsList
            pendingSubmissions={pending}
            activeHomework={activeHomework}
            classes={classes}
            selectedSubmission={selectedSubmission}
            onSelectSubmission={setSelectedSubmission}
          />
          <SubmissionReviewPanel
            selectedSubmission={selectedSubmission}
            homework={selectedSubmission ? getHomework(selectedSubmission.homeworkId) : null}
            onApproveSubmission={handleApprove}
            onRejectSubmission={handleReject}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewHomeworkTab;
