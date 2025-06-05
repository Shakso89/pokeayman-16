import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkSubmission } from "@/types/homework";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { awardCoinsToStudent } from "@/utils/pokemon/studentPokemon";

interface HomeworkReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: Homework | null;
  submissions?: HomeworkSubmission[];
  onSubmissionUpdated?: () => void;
  onSubmissionReviewed?: () => void;
}

const HomeworkReviewDialog: React.FC<HomeworkReviewDialogProps> = ({
  open,
  onOpenChange,
  homework,
  submissions: externalSubmissions,
  onSubmissionUpdated,
  onSubmissionReviewed
}) => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (homework && open) {
      if (externalSubmissions) {
        setSubmissions(externalSubmissions);
      } else {
        loadSubmissions();
      }
    }
  }, [homework, open, externalSubmissions]);

  const loadSubmissions = async () => {
    if (!homework) return;

    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('homework_id', homework.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const createNotification = async (studentId: string, title: string, message: string) => {
    try {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: studentId,
          title: title,
          message: message,
          type: 'homework_feedback'
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleApprove = async (submission: HomeworkSubmission) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'approved',
          feedback: feedback || 'Great work!'
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Award coins to student
      if (homework) {
        awardCoinsToStudent(submission.student_id, homework.coin_reward);
        
        // Create notification for student
        await createNotification(
          submission.student_id,
          'Homework Approved! 🎉',
          `Your homework "${homework.title}" has been approved! You earned ${homework.coin_reward} coins.`
        );
      }

      toast({
        title: "Success",
        description: `Submission approved for ${submission.student_name}! ${homework?.coin_reward || 0} coins awarded.`
      });

      if (externalSubmissions) {
        onSubmissionUpdated?.();
      } else {
        loadSubmissions();
      }
      setSelectedSubmission(null);
      setFeedback("");
      onSubmissionReviewed?.();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (submission: HomeworkSubmission) => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback when rejecting a submission",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'rejected',
          feedback: feedback
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Create notification for student
      if (homework) {
        await createNotification(
          submission.student_id,
          'Homework Needs Revision',
          `Your homework "${homework.title}" needs some improvements. Check the feedback and try again!`
        );
      }

      toast({
        title: "Success",
        description: `Submission rejected for ${submission.student_name}`
      });

      if (externalSubmissions) {
        onSubmissionUpdated?.();
      } else {
        loadSubmissions();
      }
      setSelectedSubmission(null);
      setFeedback("");
      onSubmissionReviewed?.();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!homework) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{homework.title} - Review Submissions</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Submissions ({submissions.length})</h3>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No submissions yet
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setFeedback(submission.feedback || "");
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{submission.student_name}</span>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Review Panel */}
          <div className="space-y-4">
            {selectedSubmission ? (
              <>
                <h3 className="font-semibold">Review Submission</h3>
                
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-3">
                    <span className="font-medium">Student:</span> {selectedSubmission.student_name}
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatDistanceToNow(new Date(selectedSubmission.submitted_at), { addSuffix: true })}
                  </div>

                  {homework.type === 'multiple_choice' ? (
                    <div>
                      <span className="font-medium">Answer:</span> {selectedSubmission.content}
                      {selectedSubmission.is_correct !== null && (
                        <Badge className={selectedSubmission.is_correct ? 'bg-green-100 text-green-800 ml-2' : 'bg-red-100 text-red-800 ml-2'}>
                          {selectedSubmission.is_correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      )}
                    </div>
                  ) : homework.type === 'image' ? (
                    <div>
                      <span className="font-medium">Image:</span>
                      <img src={selectedSubmission.content} alt="Submission" className="mt-2 max-w-full h-auto rounded" />
                    </div>
                  ) : homework.type === 'audio' ? (
                    <div>
                      <span className="font-medium">Audio:</span>
                      <audio controls className="mt-2 w-full">
                        <source src={selectedSubmission.content} />
                      </audio>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">Content:</span>
                      <p className="mt-1">{selectedSubmission.content}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Feedback</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={3}
                  />
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedSubmission)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedSubmission)}
                      disabled={isLoading}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedSubmission.status !== 'pending' && (
                  <div className="text-sm text-gray-500">
                    This submission has already been reviewed.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a submission to review
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkReviewDialog;
