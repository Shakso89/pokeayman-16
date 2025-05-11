
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Image, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";

interface SubmitHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: HomeworkAssignment | null;
  onSubmit: (file: File) => void;
}

export const SubmitHomeworkDialog: React.FC<SubmitHomeworkDialogProps> = ({
  open,
  onOpenChange,
  homework,
  onSubmit
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  // Clean up audio URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!open) {
      if (isRecording && mediaRecorderRef.current) {
        stopRecording();
      }
      
      // Reset states
      setSelectedFile(null);
      setAudioBlob(null);
      setAudioURL(null);
    }
  }, [open, isRecording]);
  
  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Convert to File object for submission
        const file = new File([audioBlob], "audio-recording.wav", { type: 'audio/wav' });
        setSelectedFile(file);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: t("recording-started"),
        description: t("recording-in-progress"),
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: t("error"),
        description: t("microphone-access-denied"),
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: t("recording-stopped"),
        description: t("recording-saved"),
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      // Reset audio recording if a file is selected manually
      setAudioBlob(null);
      setAudioURL(null);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: t("error"),
        description: t("select-file"),
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(selectedFile);
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submit-homework")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {homework && (
            <>
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium">{homework.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{homework.description}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {homework.type === "image" 
                    ? t("upload-image") 
                    : homework.type === "audio"
                    ? t("upload-or-record-audio")
                    : t("upload-file")}
                </p>
                
                {homework.type === "audio" && (
                  <div className="flex justify-center mb-4">
                    <div className="flex flex-col items-center">
                      {!audioURL ? (
                        <Button 
                          variant={isRecording ? "destructive" : "secondary"}
                          size="lg"
                          className="rounded-full h-16 w-16 flex items-center justify-center"
                          onClick={isRecording ? stopRecording : startRecording}
                        >
                          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <audio src={audioURL} controls className="w-full" />
                          <Button variant="outline" onClick={() => {
                            setAudioBlob(null);
                            setAudioURL(null);
                            setSelectedFile(null);
                          }}>
                            {t("record-again")}
                          </Button>
                        </div>
                      )}
                      <p className="text-sm mt-2 text-gray-500">
                        {isRecording 
                          ? t("recording-tap-to-stop") 
                          : audioURL 
                          ? t("recording-complete")
                          : t("tap-to-record")}
                      </p>
                    </div>
                  </div>
                )}
                
                {(!audioURL || homework.type !== "audio") && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept={
                        homework.type === "image" 
                          ? "image/*" 
                          : homework.type === "audio"
                          ? "audio/*"
                          : "*/*"
                      }
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        {homework.type === "image" ? (
                          <Image className="h-6 w-6 text-blue-600" />
                        ) : homework.type === "audio" ? (
                          <Mic className="h-6 w-6 text-blue-600" />
                        ) : (
                          <FileText className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      
                      {selectedFile && !audioURL ? (
                        <p className="text-blue-600 font-medium">{selectedFile.name}</p>
                      ) : (
                        <p className="text-gray-500">{t("click-to-upload")}</p>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile && !audioBlob}>
            <Send className="h-4 w-4 mr-2" />
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitHomeworkDialog;
