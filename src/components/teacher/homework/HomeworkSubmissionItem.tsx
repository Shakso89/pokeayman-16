
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Coins, User, Volume, Image, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HomeworkSubmissionItemProps {
  submission: HomeworkSubmission;
  onApprove?: (submission: HomeworkSubmission) => void;
  onReject?: (submission: HomeworkSubmission) => void;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onNavigateToProfile: (studentId: string) => void;
}

export const HomeworkSubmissionItem: React.FC<HomeworkSubmissionItemProps> = ({
  submission,
  onApprove,
  onReject,
  onAwardCoins,
  onNavigateToProfile
}) => {
  const { t } = useTranslation();
  const [viewContent, setViewContent] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  
  // Check if the content is a data URL
  const isDataUrl = submission.content?.startsWith('data:');
  const isImage = isDataUrl && submission.content?.startsWith('data:image/');
  const isAudio = isDataUrl && submission.content?.startsWith('data:audio/');

  // Audio player reference
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (playingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlayingAudio(!playingAudio);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between bg-white p-2 rounded-md border">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => onNavigateToProfile(submission.studentId)}>
            <AvatarFallback>{submission.studentName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{submission.studentName}</p>
            <p className="text-xs text-gray-500">
              {new Date(submission.submittedAt).toLocaleDateString()} {new Date(submission.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500"
            onClick={() => setViewContent(true)}
          >
            {t("view")}
          </Button>
          
          {isImage && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500"
              onClick={() => setShowImage(!showImage)}
            >
              <Image className="h-4 w-4" />
            </Button>
          )}
          
          {isAudio && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500"
              onClick={handlePlayAudio}
            >
              <Play className="h-4 w-4" />
              <audio 
                ref={audioRef}
                src={submission.content} 
                className="hidden"
                onEnded={() => setPlayingAudio(false)}
              />
            </Button>
          )}
          
          {submission.status === "pending" && onApprove && onReject && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-green-500"
                onClick={() => onApprove(submission)}
              >
                <Check className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500"
                onClick={() => onReject(submission)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-amber-500"
            onClick={() => onAwardCoins(submission.studentId, submission.studentName)}
          >
            <Coins className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigateToProfile(submission.studentId)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick image preview */}
      {showImage && isImage && (
        <div className="mt-2 p-2 border rounded-md bg-white">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">{t("submission-preview")}</p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowImage(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <img 
            src={submission.content} 
            alt={`${submission.studentName}'s submission`}
            className="max-h-48 max-w-full rounded-md"
          />
          <div className="mt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewContent(true)}
            >
              {t("view-full")}
            </Button>
          </div>
        </div>
      )}

      {/* Content Preview Dialog */}
      <Dialog open={viewContent} onOpenChange={setViewContent}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("student-submission")}: {submission.studentName}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {isImage ? (
              <div className="flex justify-center">
                <img 
                  src={submission.content} 
                  alt={`${submission.studentName}'s submission`}
                  className="max-h-96 max-w-full rounded-md"
                />
              </div>
            ) : isAudio ? (
              <div className="flex flex-col items-center space-y-4">
                <audio 
                  src={submission.content} 
                  controls 
                  className="w-full"
                  controlsList="nodownload"
                />
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = submission.content;
                    a.download = `${submission.studentName}_audio_submission.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  {t("download-audio")}
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                {submission.content}
              </div>
            )}
            
            {submission.feedback && (
              <div className="mt-4">
                <p className="font-medium text-sm">{t("teacher-feedback")}:</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{submission.feedback}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

