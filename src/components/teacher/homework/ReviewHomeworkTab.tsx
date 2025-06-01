
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Download, Play, Pause, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [feedback, setFeedback] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const getClassName = (classId: string) => {
    const foundClass = classes?.find(c => c.id === classId);
    return foundClass?.name || t("unknown-class");
  };

  const getHomeworkForSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return null;
    return activeHomework.find(hw => hw.id === submission.homeworkId);
  };

  const handleApprove = (submission: HomeworkSubmission) => {
    onApproveSubmission(submission);
    setSelectedSubmission(null);
    setFeedback("");
  };

  const handleReject = (submission: HomeworkSubmission) => {
    if (!feedback.trim()) {
      toast({
        title: t("error"),
        description: "Please provide feedback for rejection",
        variant: "destructive"
      });
      return;
    }
    onRejectSubmission(submission, feedback);
    setSelectedSubmission(null);
    setFeedback("");
  };

  const handleDownload = (content: string, type: string, studentName: string) => {
    const a = document.createElement('a');
    a.href = content;
    a.download = `${studentName}_submission.${type === 'audio' ? 'mp3' : type === 'image' ? 'png' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderMultipleChoiceReview = (submission: HomeworkSubmission, homework: HomeworkAssignment) => {
    if (!homework.questions || !submission.answers) return null;

    return (
      <div className="space-y-4">
        {homework.questions.map((question, qIndex) => {
          const studentAnswers = submission.answers?.[qIndex] || [];
          const correctAnswers = question.correctAnswers;
          const isCorrect = correctAnswers.every(ca => studentAnswers.includes(ca)) && 
                           studentAnswers.every(sa => correctAnswers.includes(sa));

          return (
            <div key={question.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{question.question}</h4>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = studentAnswers.includes(oIndex);
                  const isCorrect = correctAnswers.includes(oIndex);
                  
                  return (
                    <div 
                      key={oIndex} 
                      className={`p-2 rounded flex items-center justify-between ${
                        isSelected && isCorrect ? 'bg-green-100 text-green-800' :
                        isSelected && !isCorrect ? 'bg-red-100 text-red-800' :
                        !isSelected && isCorrect ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-50'
                      }`}
                    >
                      <span>{option}</span>
                      <div className="flex gap-1">
                        {isSelected && <Badge variant="outline">Selected</Badge>}
                        {isCorrect && <Badge variant="outline" className="bg-green-100">Correct</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2">
                <Badge variant={isCorrect ? "default" : "destructive"}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const pendingSubmissions = submissions.filter(s => s.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("review-homework-submissions")}</h3>
        <Badge variant="secondary">{pendingSubmissions.length} pending reviews</Badge>
      </div>

      {pendingSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">{t("no-pending-submissions")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            <h4 className="font-medium">{t("pending-submissions")}</h4>
            {pendingSubmissions.map(submission => {
              const homework = getHomeworkForSubmission(submission.id);
              if (!homework) return null;

              return (
                <Card 
                  key={submission.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedSubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">{homework.title}</CardTitle>
                        <p className="text-xs text-gray-500">{getClassName(homework.classId)}</p>
                      </div>
                      <Badge variant="outline">{submission.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">{submission.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submission Review Panel */}
          <div>
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{selectedSubmission.studentName}'s Submission</span>
                    <Badge variant="outline">{selectedSubmission.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Render content based on type */}
                  {selectedSubmission.type === "text" && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>{selectedSubmission.content}</p>
                    </div>
                  )}

                  {selectedSubmission.type === "image" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingImage(selectedSubmission.content)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Image
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(selectedSubmission.content, 'image', selectedSubmission.studentName)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      {viewingImage && (
                        <div className="relative">
                          <img 
                            src={viewingImage} 
                            alt="Student submission" 
                            className="max-w-full rounded-md"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => setViewingImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSubmission.type === "audio" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (playingAudio === selectedSubmission.id) {
                              setPlayingAudio(null);
                            } else {
                              setPlayingAudio(selectedSubmission.id);
                            }
                          }}
                        >
                          {playingAudio === selectedSubmission.id ? (
                            <Pause className="h-4 w-4 mr-1" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          {playingAudio === selectedSubmission.id ? "Pause" : "Play"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(selectedSubmission.content, 'audio', selectedSubmission.studentName)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      {playingAudio === selectedSubmission.id && (
                        <audio 
                          controls 
                          autoPlay
                          src={selectedSubmission.content}
                          className="w-full"
                          onEnded={() => setPlayingAudio(null)}
                        />
                      )}
                    </div>
                  )}

                  {selectedSubmission.type === "multiple_choice" && (
                    <div>
                      {renderMultipleChoiceReview(
                        selectedSubmission, 
                        getHomeworkForSubmission(selectedSubmission.id)!
                      )}
                    </div>
                  )}

                  {/* Feedback section */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback">{t("feedback")} (optional for approval, required for rejection)</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={t("provide-feedback-to-student")}
                      rows={3}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedSubmission)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t("approve")}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(selectedSubmission)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">{t("select-submission-to-review")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHomeworkTab;
