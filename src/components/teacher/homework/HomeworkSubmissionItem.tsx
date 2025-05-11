
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { StudentInfoBadge } from "./submission-components/StudentInfoBadge";
import { SubmissionActionButtons } from "./submission-components/SubmissionActionButtons";
import { AudioPlayer } from "./submission-components/AudioPlayer";
import { ImagePreview } from "./submission-components/ImagePreview";
import { SubmissionContentDialog } from "./submission-components/SubmissionContentDialog";

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
  const [viewContent, setViewContent] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  
  // Check if the content is a data URL
  const isDataUrl = submission.content?.startsWith('data:');
  const isImage = isDataUrl && submission.content?.startsWith('data:image/');
  const isAudio = isDataUrl && submission.content?.startsWith('data:audio/');

  return (
    <>
      <div className="flex items-center justify-between bg-white p-2 rounded-md border mb-2">
        {/* Student information */}
        <StudentInfoBadge 
          student={{
            id: submission.studentId,
            name: submission.studentName
          }}
          submissionDate={submission.submittedAt}
          onNavigateToProfile={onNavigateToProfile}
        />
        
        {/* Action buttons */}
        <SubmissionActionButtons 
          submission={submission}
          isImage={isImage}
          isAudio={isAudio}
          playingAudio={playingAudio}
          setPlayingAudio={setPlayingAudio}
          setShowImage={setShowImage}
          setViewContent={setViewContent}
          onApprove={onApprove}
          onReject={onReject}
          onAwardCoins={onAwardCoins}
          onNavigateToProfile={onNavigateToProfile}
        />
      </div>

      {/* Audio Player when playing */}
      {playingAudio && isAudio && !viewContent && (
        <AudioPlayer 
          audioSrc={submission.content}
          studentName={submission.studentName}
          onStopPlaying={() => setPlayingAudio(false)}
          onViewFull={() => setViewContent(true)}
        />
      )}

      {/* Quick image preview */}
      {showImage && isImage && (
        <ImagePreview
          imageSrc={submission.content}
          studentName={submission.studentName}
          onClose={() => setShowImage(false)}
          onViewFull={() => setViewContent(true)}
        />
      )}

      {/* Content Preview Dialog */}
      <SubmissionContentDialog
        open={viewContent}
        onOpenChange={setViewContent}
        submission={submission}
        isImage={isImage}
        isAudio={isAudio}
      />
    </>
  );
};

