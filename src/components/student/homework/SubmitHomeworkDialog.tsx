
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
import { saveHomeworkSubmission } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { Mic, Square, Play, Pause, Upload, Image } from "lucide-react";

export interface SubmitHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: HomeworkAssignment;
  studentId: string;
  studentName: string;
  onSubmissionComplete: (submissionData: any) => void;
}

const SubmitHomeworkDialog: React.FC<SubmitHomeworkDialogProps> = ({
  open,
  onOpenChange,
  homework,
  studentId,
  studentName,
  onSubmissionComplete
}) => {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<number[][]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Initialize multiple choice answers when dialog opens
  React.useEffect(() => {
    if (homework.type === "multiple_choice" && homework.questions) {
      setMultipleChoiceAnswers(homework.questions.map(() => []));
    }
  }, [homework]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudio(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const playRecording = () => {
    if (recordedAudio && !isPlaying) {
      const audio = new Audio(recordedAudio);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMultipleChoiceAnswer = (questionIndex: number, optionIndex: number, isChecked: boolean) => {
    setMultipleChoiceAnswers(prev => {
      const newAnswers = [...prev];
      if (isChecked) {
        if (!newAnswers[questionIndex].includes(optionIndex)) {
          newAnswers[questionIndex] = [...newAnswers[questionIndex], optionIndex];
        }
      } else {
        newAnswers[questionIndex] = newAnswers[questionIndex].filter(idx => idx !== optionIndex);
      }
      return newAnswers;
    });
  };
  
  const handleSubmit = async () => {
    let content = "";
    
    switch (homework.type) {
      case "audio":
        content = recordedAudio || "";
        break;
      case "image":
        content = imagePreview || "";
        break;
      case "multiple_choice":
        content = JSON.stringify(multipleChoiceAnswers);
        break;
      default:
        content = answer;
    }
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    const submission = {
      id: uuidv4(),
      homeworkId: homework.id,
      studentId,
      studentName,
      content,
      type: homework.type,
      submittedAt: new Date().toISOString(),
      status: "pending" as const,
      answers: homework.type === "multiple_choice" ? multipleChoiceAnswers : undefined
    };
    
    try {
      await saveHomeworkSubmission(submission);
      onSubmissionComplete(submission);
    } catch (error) {
      console.error("Error submitting homework:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canSubmit = () => {
    switch (homework.type) {
      case "audio":
        return recordedAudio;
      case "image":
        return selectedImage;
      case "multiple_choice":
        return multipleChoiceAnswers.some(answers => answers.length > 0);
      default:
        return answer.trim();
    }
  };
  
  const renderAnswerInput = () => {
    switch (homework.type) {
      case "audio":
        return (
          <div className="space-y-4">
            <Label className="mb-2 block">
              {t("record-your-answer")}:
            </Label>
            
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {t("start-recording")}
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  {t("stop-recording")}
                </Button>
              )}
              
              {recordedAudio && (
                <Button
                  onClick={playRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? t("pause") : t("play")}
                </Button>
              )}
            </div>
            
            {isRecording && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                {t("recording")}...
              </div>
            )}
            
            {recordedAudio && (
              <div className="text-green-600 text-sm">
                ✓ {t("audio-recorded-successfully")}
              </div>
            )}
          </div>
        );
        
      case "image":
        return (
          <div className="space-y-4">
            <Label className="mb-2 block">
              {t("upload-your-image")}:
            </Label>
            
            <div className="space-y-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {t("select-image")}
              </Button>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview && (
                <div className="space-y-2">
                  <div className="border rounded-lg p-4">
                    <img
                      src={imagePreview}
                      alt="Selected"
                      className="max-w-full h-auto max-h-48 mx-auto"
                    />
                  </div>
                  <div className="text-green-600 text-sm">
                    ✓ {t("image-selected-successfully")}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case "multiple_choice":
        return (
          <div className="space-y-6">
            <Label className="mb-2 block">
              {t("select-your-answers")}:
            </Label>
            
            {homework.questions?.map((question, questionIndex) => (
              <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-medium">
                  {questionIndex + 1}. {question.question}
                </h4>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`q${questionIndex}-o${optionIndex}`}
                        checked={multipleChoiceAnswers[questionIndex]?.includes(optionIndex) || false}
                        onCheckedChange={(checked) => 
                          handleMultipleChoiceAnswer(questionIndex, optionIndex, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`q${questionIndex}-o${optionIndex}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <div>
            <Label htmlFor="answer" className="mb-2 block">
              {t("your-answer")}:
            </Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("type-your-answer-here")}
              className="min-h-32"
            />
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("submit-homework")}</DialogTitle>
          <DialogDescription>
            {homework.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <div className="mb-4 text-sm">
              <p className="font-medium mb-2">{t("assignment")}:</p>
              <p>{homework.description}</p>
            </div>
            
            {renderAnswerInput()}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitHomeworkDialog;
