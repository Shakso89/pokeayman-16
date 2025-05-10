
import React, { useRef, useState } from "react";
import { Camera, Mic, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Battle } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface BattleSubmissionProps {
  selectedBattle: Battle;
  studentId: string | null;
  studentName: string | null;
  hasSubmittedAnswer: (battle: Battle) => boolean;
  formatDateTime: (dateString: string) => string;
  getTimeRemaining: (timeLimit: string) => string;
  onBattleUpdate: (updatedBattle: Battle) => void;
}

export const BattleSubmission: React.FC<BattleSubmissionProps> = ({
  selectedBattle,
  studentId,
  studentName,
  hasSubmittedAnswer,
  formatDateTime,
  getTimeRemaining,
  onBattleUpdate,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"photo" | "voice">("photo");
  const [mediaContent, setMediaContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaContent(reader.result as string);
        setMediaType("photo");
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaContent(reader.result as string);
          setMediaType("voice");
        };
        reader.readAsDataURL(audioBlob);
      });
      
      mediaRecorder.start();
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 30000);
      
      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone", error);
      toast({
        title: t("error"),
        description: t("microphone-access-error"),
        variant: "destructive"
      });
      return null;
    }
  };

  const handleMicClick = async () => {
    const recorder = await startRecording();
    if (!recorder) return;
    
    toast({
      title: t("recording"),
      description: t("recording-description"),
    });
    
    // Stop recording after 5 seconds for demo purposes
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
        toast({
          title: t("recording-stopped"),
          description: t("recording-stopped-description"),
        });
      }
    }, 5000);
  };

  const handleSubmit = () => {
    if (!selectedBattle || !mediaContent || !studentId || !studentName) return;
    
    setIsSubmitting(true);
    
    // Create answer object
    const answer = {
      studentId,
      studentName,
      submissionTime: new Date().toISOString(),
      submission: {
        type: mediaType,
        content: mediaContent
      }
    };
    
    // Update battle in localStorage
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedBattles = allBattles.map((b: Battle) => {
      if (b.id === selectedBattle.id) {
        return {
          ...b,
          answers: [...(b.answers || []), answer]
        };
      }
      return b;
    });
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update local state via callback
    const updatedBattle = {
      ...selectedBattle,
      answers: [...(selectedBattle.answers || []), answer]
    };
    
    onBattleUpdate(updatedBattle);
    
    // Reset form
    setMediaContent(null);
    setIsSubmitting(false);
    
    toast({
      title: t("answer-submitted"),
      description: t("answer-submitted-description"),
    });
  };

  const cancelSubmission = () => {
    setMediaContent(null);
  };

  return (
    <>
      {hasSubmittedAnswer(selectedBattle) ? (
        <div className="text-center py-6">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("answer-submitted-title")}</h3>
          <p className="text-gray-500">{t("answer-submitted-waiting")}</p>
          
          {selectedBattle.winner && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t("battle-winner")}
              </h4>
              
              <div className="flex items-center gap-3 justify-center">
                <Avatar>
                  <AvatarFallback>
                    {selectedBattle.winner.studentName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{selectedBattle.winner.studentName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(selectedBattle.winner.submissionTime)}
                  </p>
                </div>
              </div>
              
              {selectedBattle.winner.studentId === studentId && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">{t("you-won-battle")}</p>
                  <p className="text-sm text-green-700">
                    {t("reward-received").replace("{{coins}}", ((selectedBattle.baseReward || 0) + (selectedBattle.participants?.length || 0)).toString())}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <h3 className="text-lg font-medium mb-2">{t("submit-answer")}</h3>
          <p className="text-gray-500 mb-4">{t("submit-answer-description")}</p>
          
          {!mediaContent ? (
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handlePhotoClick}
                className="flex gap-2 items-center"
              >
                <Camera className="h-4 w-4" />
                {t("take-photo")}
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              
              <Button 
                onClick={handleMicClick}
                className="flex gap-2 items-center"
              >
                <Mic className="h-4 w-4" />
                {t("record-voice")}
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {mediaType === "photo" ? (
                <img 
                  src={mediaContent} 
                  alt="Your answer" 
                  className="max-h-60 object-contain mb-4 rounded-lg mx-auto"
                />
              ) : (
                <audio 
                  controls 
                  src={mediaContent}
                  className="w-full mb-4"
                />
              )}
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={cancelSubmission}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("submitting") : t("submit-answer")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
