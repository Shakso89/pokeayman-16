
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Coins, FileText, Image, Mic, Play, Pause, Check, X } from "lucide-react";
import { useState, useRef } from "react";

interface TeacherHomeworkCardProps {
  homework: HomeworkAssignment;
  className: string;
  submissions: HomeworkSubmission[];
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission) => void;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onNavigateToStudentProfile: (studentId: string) => void;
  isActive: boolean;
}

export const TeacherHomeworkCard: React.FC<TeacherHomeworkCardProps> = ({
  homework,
  className,
  submissions,
  onApproveSubmission,
  onRejectSubmission,
  onAwardCoins,
  onDeleteHomework,
  onNavigateToStudentProfile,
  isActive
}) => {
  const { t } = useTranslation();
  const now = new Date();
  const hoursRemaining = isActive ? 
    Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60)) : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const SubmissionItem: React.FC<{ submission: HomeworkSubmission }> = ({ submission }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const isDataUrl = submission.content?.startsWith('data:');
    const isImage = isDataUrl && submission.content?.startsWith('data:image/');
    const isAudio = isDataUrl && submission.content?.startsWith('data:audio/');

    const handlePlayAudio = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
      }
    };

    return (
      <div className="border rounded-lg p-3 mb-2 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToStudentProfile(submission.studentId)}
              className="font-medium text-blue-600 hover:text-blue-800 p-0 h-auto"
            >
              {submission.studentName}
            </Button>
            <Badge className={getStatusColor(submission.status)}>
              {t(submission.status)}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(submission.submittedAt).toLocaleString()}
          </span>
        </div>

        {/* Content Preview */}
        <div className="mb-2">
          {isImage && (
            <div className="mb-2">
              <img 
                src={submission.content} 
                alt="Submission"
                className="max-w-32 max-h-32 rounded cursor-pointer"
                onClick={() => setShowImage(!showImage)}
              />
              {showImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImage(false)}>
                  <img src={submission.content} alt="Full submission" className="max-w-full max-h-full" />
                </div>
              )}
            </div>
          )}
          
          {isAudio && (
            <div className="mb-2 flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handlePlayAudio}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <audio 
                ref={audioRef}
                src={submission.content}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
          
          {!isImage && !isAudio && (
            <p className="text-sm bg-white p-2 rounded border">
              {submission.content.length > 100 
                ? `${submission.content.substring(0, 100)}...` 
                : submission.content}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {submission.status === 'pending' && (
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => onApproveSubmission(submission)}
            >
              <Check className="h-4 w-4 mr-1" />
              {t("approve")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => onRejectSubmission(submission)}
            >
              <X className="h-4 w-4 mr-1" />
              {t("reject")}
            </Button>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
            onClick={() => onAwardCoins(submission.studentId, submission.studentName)}
          >
            <Coins className="h-4 w-4 mr-1" />
            {t("award-coins")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={!isActive ? "opacity-75 bg-gray-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(homework.type)}
            <CardTitle className="text-lg">{homework.title}</CardTitle>
          </div>
          <Badge variant="secondary">{className}</Badge>
        </div>
        <CardDescription className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {isActive ? (
              <span>{t("expires-in")} {hoursRemaining} {t("hours")}</span>
            ) : (
              <span className="text-red-600">{t("expired")}</span>
            )}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{submissions.length} {t("submissions")}</span>
          </div>
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-1" />
            <span>{homework.coinReward} {t("coins")}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{homework.description}</p>
        
        {/* Submissions */}
        <div>
          <h4 className="font-medium mb-2">{t("submissions")}:</h4>
          {submissions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {submissions.map(submission => (
                <SubmissionItem key={submission.id} submission={submission} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">{t("no-submissions-yet")}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-600">
          {t("created")}: {new Date(homework.createdAt).toLocaleDateString()}
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDeleteHomework(homework.id)}
        >
          {t("delete")}
        </Button>
      </CardFooter>
    </Card>
  );
};
