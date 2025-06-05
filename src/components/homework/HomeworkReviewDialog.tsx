
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
import { createHomeworkNotification } from "@/utils/notificationService";

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
        console.log("Using external submissions:", externalSubmissions);
        setSubmissions(externalSubmissions);
      } else {
        loadSubmissions();
      }
      
      // Set up real-time subscription for submissions
      const channel = supabase
        .channel(`homework-submissions-${homework.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'homework_submissions',
            filter: `homework_id=eq.${homework.id}`
          },
          (payload) => {
            console.log("Real-time submission update:", payload);
            if (externalSubmissions) {
              onSubmissionUpdated?.();
            } else {
              loadSubmissions();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [homework, open, externalSubmissions]);

  const loadSubmissions = async () => {
    if (!homework) return;

    try {
      console.log("Loading submissions for homework:", homework.id);
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('homework_id', homework.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error("Error loading submissions:", error);
        throw error;
      }
      
      console.log("Loaded submissions:", data);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      });
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
        await createHomeworkNotification(
          submission.student_id,
          homework.title,
          'approved',
          feedback || 'Great work!'
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
        await createHomeworkNotification(
          submission.student_id,
          homework.title,
          'rejected',
          feedback
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

  const renderSubmissionContent = (submission: HomeworkSubmission) => {
    if (!homework) return null;

    if (homework.type === 'multiple_choice') {
      try {
        const answers = submission.answers || JSON.parse(submission.content || '{}');
        const questions = homework.questions || [];
        
        if (questions.length > 0) {
          return (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const questionKey = question.id || `question_${index}`;
                const studentAnswer = answers[questionKey] || answers[index.toString()];
                const isCorrect = studentAnswer === question.correct_option;
                
                return (
                  <div key={questionKey} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Question {index + 1}:</h4>
                    <p className="mb-3">{question.question}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = question[`option_${option.toLowerCase()}` as keyof typeof question];
                        const isSelected = studentAnswer === option;
                        const isCorrectOption = question.correct_option === option;
                        
                        return (
                          <div
                            key={option}
                            className={`p-2 rounded border text-sm ${
                              isSelected && isCorrectOption ? 'bg-green-100 border-green-300' :
                              isSelected && !isCorrectOption ? 'bg-red-100 border-red-300' :
                              !isSelected && isCorrectOption ? 'bg-blue-100 border-blue-300' :
                              'bg-white border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{option}:</span> {optionText}
                            {isSelected && <span className="ml-2 text-xs">(Selected)</span>}
                            {!isSelected && isCorrectOption && <span className="ml-2 text-xs text-blue-600">(Correct)</span>}
                          </div>
                        );
                      })}
                    </div>
                    
                    <Badge className={isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          );
        } else {
          // Legacy single question format
          const answer = submission.content;
          return (
            <div>
              <div className="mb-2">
                <span className="font-medium">Question:</span> {homework.question}
              </div>
              <div className="mb-2">
                <span className="font-medium">Student Answer:</span> {answer}
              </div>
              {submission.is_correct !== null && (
                <Badge className={submission.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {submission.is_correct ? 'Correct' : 'Incorrect'}
                </Badge>
              )}
            </div>
          );
        }
      } catch (error) {
        console.error("Error parsing answers:", error);
        return (
          <div>
            <span className="font-medium">Answer:</span> {submission.content}
          </div>
        );
      }
    } else if (homework.type === 'image') {
      return (
        <div>
          <span className="font-medium">Image:</span>
          <img 
            src={submission.content} 
            alt="Submission" 
            className="mt-2 max-w-full h-auto rounded cursor-pointer"
            onClick={() => window.open(submission.content, '_blank')}
          />
        </div>
      );
    } else if (homework.type === 'audio') {
      return (
        <div>
          <span className="font-medium">Audio:</span>
          <audio controls className="mt-2 w-full" preload="metadata">
            <source src={submission.content} type="audio/mpeg" />
            <source src={submission.content} type="audio/wav" />
            <source src={submission.content} type="audio/ogg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else {
      return (
        <div>
          <span className="font-medium">Content:</span>
          <p className="mt-1">{submission.content}</p>
        </div>
      );
    }
  };

  if (!homework) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
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

                  {renderSubmissionContent(selectedSubmission)}
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
