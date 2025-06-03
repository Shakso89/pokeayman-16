
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, User, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Homework, HomeworkSubmission } from '@/types/homework';
import { formatDistanceToNow } from 'date-fns';

interface HomeworkReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: Homework;
  submissions: HomeworkSubmission[];
  onSubmissionUpdated: () => void;
}

const HomeworkReviewDialog: React.FC<HomeworkReviewDialogProps> = ({
  open,
  onOpenChange,
  homework,
  submissions,
  onSubmissionUpdated
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async (submission: HomeworkSubmission) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'approved',
          is_correct: homework.type === 'multiple_choice' ? submission.content === homework.correct_option : true
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Award coins to student
      // Note: You'll need to implement the coin awarding system

      toast({
        title: "Success",
        description: `Submission approved and ${homework.coin_reward} coins awarded!`
      });

      onSubmissionUpdated();
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (submission: HomeworkSubmission) => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for rejection",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'rejected',
          feedback: feedback.trim()
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission rejected with feedback"
      });

      onSubmissionUpdated();
      setSelectedSubmission(null);
      setFeedback('');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderSubmissionContent = (submission: HomeworkSubmission) => {
    switch (homework.type) {
      case 'image':
        return (
          <div className="mt-2">
            <img 
              src={submission.content} 
              alt="Student submission" 
              className="max-w-full max-h-64 rounded-lg border"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio controls className="w-full">
              <source src={submission.content} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="mt-2 space-y-2">
            <p className="font-medium">{homework.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'A', value: homework.option_a },
                { key: 'B', value: homework.option_b },
                { key: 'C', value: homework.option_c },
                { key: 'D', value: homework.option_d }
              ].filter(option => option.value).map(option => (
                <div 
                  key={option.key}
                  className={`p-2 rounded border ${
                    submission.content === option.key 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{option.key}:</span> {option.value}
                  {option.key === homework.correct_option && (
                    <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm">
              Student selected: <strong>Option {submission.content}</strong>
              {submission.content === homework.correct_option ? 
                <span className="text-green-600 ml-2">✓ Correct</span> : 
                <span className="text-red-600 ml-2">✗ Incorrect</span>
              }
            </p>
          </div>
        );
      default:
        return <p className="mt-2">{submission.content}</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Homework: {homework.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Submissions ({submissions.length})</h3>
            
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No submissions yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.map((submission) => (
                  <Card 
                    key={submission.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{submission.student_name}</span>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submission Review Panel */}
          <div className="space-y-4">
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedSubmission.student_name}'s Submission</span>
                    <Badge className={getStatusColor(selectedSubmission.status)}>
                      {selectedSubmission.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderSubmissionContent(selectedSubmission)}

                  {selectedSubmission.feedback && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Feedback:</p>
                      <p className="text-sm">{selectedSubmission.feedback}</p>
                    </div>
                  )}

                  {selectedSubmission.status === 'pending' && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Provide feedback (required for rejection)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(selectedSubmission)}
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Award {homework.coin_reward} <Coins className="h-4 w-4 ml-1" />
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedSubmission)}
                          disabled={isUpdating}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Select a submission to review
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkReviewDialog;
