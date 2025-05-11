
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AudioPlayerProps {
  audioSrc: string;
  studentName: string;
  onStopPlaying: () => void;
  onViewFull: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  studentName,
  onStopPlaying,
  onViewFull
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-2 p-2 border rounded-md bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium">{t("audio-submission")}</p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onStopPlaying}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <audio 
        controls
        src={audioSrc}
        className="w-full"
        controlsList="nodownload"
        onPause={onStopPlaying}
      />
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewFull}
        >
          {t("view-full")}
        </Button>
      </div>
    </div>
  );
};
