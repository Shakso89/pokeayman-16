
import React, { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Button } from "@/components/ui/button";
import { Check, X, Coins, User, Play, Pause } from "lucide-react";

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
  studentCoins?: number;
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
  onNavigateToProfile,
  studentCoins = 0
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
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Content Type Indicators with Action Buttons */}
          {isAudio && (
            <Button 
              variant="outline"
              size="sm"
              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              onClick={handlePlayAudio}
            >
              {playingAudio ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {playingAudio ? "Pause" : "Play"} 
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
              View Image
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
        </div>
        
        <div className="flex items-center space-x-2">
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
            title="Award coins"
          >
            <Coins className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigateToProfile(submission.studentId)}
            title="View student profile"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Student coins display */}
      <div className="text-xs text-right text-amber-500 font-medium flex items-center justify-end">
        <Coins className="h-3 w-3 mr-1" />
        Current balance: {studentCoins} coins
      </div>
    </div>
  );
};
