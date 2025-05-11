
import React, { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Button } from "@/components/ui/button";
import { Check, X, Coins, User, FileAudio, FileImage, Play, Headphones } from "lucide-react";

interface SubmissionActionButtonsProps {
  submission: HomeworkSubmission;
  isImage: boolean;
  isAudio: boolean;
  playingAudio: boolean;
  setPlayingAudio: (playing: boolean) => void;
  setShowImage: (show: boolean) => void;
  setViewContent: (show: boolean) => void;
  onApprove?: (submission: HomeworkSubmission) => void;
  onReject?: (submission: HomeworkSubmission) => void;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onNavigateToProfile: (studentId: string) => void;
}

export const SubmissionActionButtons: React.FC<SubmissionActionButtonsProps> = ({
  submission,
  isImage,
  isAudio,
  playingAudio,
  setPlayingAudio,
  setShowImage,
  setViewContent,
  onApprove,
  onReject,
  onAwardCoins,
  onNavigateToProfile
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="flex items-center space-x-2">
      {/* Content Type Indicators with Action Buttons */}
      {isAudio && (
        <Button 
          variant="outline"
          size="sm"
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          onClick={handlePlayAudio}
        >
          {playingAudio ? "Pause" : "Play"} 
          <Headphones className="ml-1 h-4 w-4" />
          <audio 
            ref={audioRef}
            src={submission.content} 
            className="hidden"
            onEnded={() => setPlayingAudio(false)}
          />
        </Button>
      )}
      
      {isImage && (
        <Button
          variant="outline"
          size="sm"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          onClick={() => setShowImage(true)}
        >
          View <FileImage className="ml-1 h-4 w-4" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-blue-500"
        onClick={() => setViewContent(true)}
      >
        {t("view")}
      </Button>
      
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
  );
};
