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
  const [localSubmissions, setLocalSubmissions] = useState<HomeworkSubmission[]>(submissions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLocalSubmissions(submissions);
  }, [submissions]);

  useEffect(() => {
    const channel = supabase
      .channel("homework-submissions-review")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "homework_submissions",
      }, () => refreshSubmissions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      const { data: homeworkData, error: hwError } = await supabase
        .from("homework")
        .select("id")
        .eq("teacher_id", teacherId);

      if (hwError || !homeworkData?.length) return setLocalSubmissions([]);

      const homeworkIds = homeworkData.map((h) => h.id);
      const { data: submissionsData, error: subError } = await supabase
        .from("homework_submissions")
        .select("*")
        .in("homework_id", homeworkIds)
        .order("submitted_at", { ascending: false });

      if (subError) return;

      const mapped = submissionsData?.map((s) => ({
        id: s.id,
        homeworkId: s.homework_id,
        studentId: s.student_id,
        studentName: s.student_name,
        content: s.content,
        type: s.type,
        submittedAt: s.submitted_at ? new Date(s.submitted_at).toISOString() : "",
        status: s.status,
        feedback: s.feedback,
        answers: s.answers ? JSON.parse(s.answers) : undefined,
      })) || [];

      const unique = Array.from(new Map(mapped.map((s) => [s.id, s])).values());
      setLocalSubmissions(unique);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const pending = localSubmissions.filter((s) => s.status === "pending");
  const getHomework = (id: string) => activeHomework.find((hw) => hw.id === id) || null;

  const handleApprove = (sub: HomeworkSubmission) => {
    onApproveSubmission(sub);
    setSelectedSubmission(null);
  };

  const handleReject = (sub: HomeworkSubmission, feedback: string) => {
    onRejectSubmission(sub, feedback);
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("review-homework-submissions")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshSubmissions} disabled={isRefreshing}>
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
            {t("no-pending-submissions")}
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
