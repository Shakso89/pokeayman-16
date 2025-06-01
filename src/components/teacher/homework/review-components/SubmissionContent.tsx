
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause, Eye, X } from "lucide-react";

interface SubmissionContentProps {
  submission: HomeworkSubmission;
  onDownload: (content: string, type: string, studentName: string) => void;
}

export const SubmissionContent: React.FC<SubmissionContentProps> = ({
  submission,
  onDownload
}) => {
  const { t } = useTranslation();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  if (submission.type === "text") {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <p>{submission.content}</p>
      </div>
    );
  }

  if (submission.type === "image") {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewingImage(submission.content)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Image
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDownload(submission.content, 'image', submission.studentName)}
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
    );
  }

  if (submission.type === "audio") {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (playingAudio === submission.id) {
                setPlayingAudio(null);
              } else {
                setPlayingAudio(submission.id);
              }
            }}
          >
            {playingAudio === submission.id ? (
              <Pause className="h-4 w-4 mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {playingAudio === submission.id ? "Pause" : "Play"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDownload(submission.content, 'audio', submission.studentName)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
        {playingAudio === submission.id && (
          <audio 
            controls 
            autoPlay
            src={submission.content}
            className="w-full"
            onEnded={() => setPlayingAudio(null)}
          />
        )}
      </div>
    );
  }

  return null;
};
