
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkSubmission } from "@/types/homework";
import { StudentInfoBadge } from "./submission-components/StudentInfoBadge";
import { SubmissionActionButtons } from "./submission-components/SubmissionActionButtons";
import { AudioPlayer } from "./submission-components/AudioPlayer";
import { ImagePreview } from "./submission-components/ImagePreview";
import { SubmissionContentDialog } from "./submission-components/SubmissionContentDialog";
import { useNavigate } from "react-router-dom";

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
  const [studentCoins, setStudentCoins] = useState(0);
  const navigate = useNavigate();
  
  // Check if the content is a data URL
  const isDataUrl = submission.content?.startsWith('data:');
  const isImage = isDataUrl && submission.content?.startsWith('data:image/');
  const isAudio = isDataUrl && submission.content?.startsWith('data:audio/');

  // Fetch student coins when the component loads
  useEffect(() => {
    const fetchStudentCoins = () => {
      try {
        // Get student Pokemon data which includes coins
        const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
        const studentData = studentPokemons.find((p: any) => p.studentId === submission.studentId);
        if (studentData) {
          setStudentCoins(studentData.coins || 0);
        }
      } catch (error) {
        console.error("Error fetching student coins:", error);
      }
    };

    fetchStudentCoins();
  }, [submission.studentId]);

  const handleStudentClick = () => {
    navigate(`/teacher/student/${submission.studentId}`);
  };

  return (
    <>
      <div className="flex flex-col bg-white p-3 rounded-md border mb-3">
        {/* Student information */}
        <div className="flex items-center justify-between mb-2">
          <StudentInfoBadge 
            student={{
              id: submission.studentId,
              name: submission.studentName
            }}
            submissionDate={submission.submittedAt}
            onNavigateToProfile={handleStudentClick}
          />
        </div>
        
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
          studentCoins={studentCoins}
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
