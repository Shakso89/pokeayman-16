
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Mic, MicOff, FileUp, Send } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";

interface HomeworkTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({ studentId, studentName, classId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkAssignment | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<{[id: string]: string}>({});
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  useEffect(() => {
    loadHomeworkData();
    loadClassesData();
  }, [classId]);
  
  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  const loadClassesData = () => {
    // Get class information for displaying class names
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const classMap: {[id: string]: string} = {};
    
    allClasses.forEach((cls: any) => {
      classMap[cls.id] = cls.name;
    });
    
    setClasses(classMap);
  };
  
  const loadHomeworkData = () => {
    console.log("Loading homework for class:", classId);
    
    // Get all homework assignments
    const allHomeworks = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    
    // Filter for homework assigned to student's class that hasn't expired
    const now = new Date();
    const activeHomeworks = allHomeworks.filter((hw: HomeworkAssignment) => {
      const isForClass = hw.classId === classId;
      const isActive = new Date(hw.expiresAt) > now;
      return isForClass && isActive;
    });
    
    console.log("Found active homeworks:", activeHomeworks.length);
    setHomeworks(activeHomeworks);
    
    // Get all submissions
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    
    // Filter for student's submissions
    const studentSubmissions = allSubmissions.filter((sub: HomeworkSubmission) => 
      sub.studentId === studentId
    );
    
    setSubmissions(studentSubmissions);
  };
  
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
  
  const handleSubmitHomework = async () => {
    if (!selectedHomework || !selectedFile) {
      toast({
        title: t("error"),
        description: t("select-file"),
        variant: "destructive"
      });
      return;
    }
    
    try {
      // For a real app, we would upload to a server
      // For this demo, we'll create a data URL
      const fileContent = await readFileAsDataURL(selectedFile);
      
      // Create submission object
      const submission: HomeworkSubmission = {
        id: `submission-${Date.now()}`,
        homeworkId: selectedHomework.id,
        studentId,
        studentName,
        content: fileContent,
        type: selectedHomework.type,
        submittedAt: new Date().toISOString(),
        status: "pending"
      };
      
      // Save submission to localStorage
      const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
      allSubmissions.push(submission);
      localStorage.setItem("homeworkSubmissions", JSON.stringify(allSubmissions));
      
      // Update state
      setSubmissions([...submissions, submission]);
      setSelectedFile(null);
      setAudioBlob(null);
      setAudioURL(null);
      setIsSubmitOpen(false);
      
      toast({
        title: t("success"),
        description: t("homework-submitted"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("submission-failed"),
        variant: "destructive"
      });
    }
  };
  
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      // Reset audio recording if a file is selected manually
      setAudioBlob(null);
      setAudioURL(null);
    }
  };
  
  // Check if student has submitted for a homework
  const hasSubmitted = (homeworkId: string) => {
    return submissions.some(sub => sub.homeworkId === homeworkId);
  };
  
  // Get submission status for a homework
  const getSubmissionStatus = (homeworkId: string) => {
    const submission = submissions.find(sub => sub.homeworkId === homeworkId);
    return submission ? submission.status : null;
  };
  
  // Get class name for a homework
  const getClassName = (classId: string) => {
    return classes[classId] || t("unknown-class");
  };
  
  // Get homework type icon
  const getHomeworkTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-5 w-5 text-blue-500" />;
      case "image": return <Image className="h-5 w-5 text-green-500" />;
      case "audio": return <Mic className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };
  
  const now = new Date();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("my-homework")}</CardTitle>
        <CardDescription>{t("homework-description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {homeworks.length === 0 ? (
          <div className="text-center py-12">
            <p>{t("no-homework")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {homeworks.map(homework => {
              const submitted = hasSubmitted(homework.id);
              const status = getSubmissionStatus(homework.id);
              const isExpired = new Date(homework.expiresAt) <= now;
              
              return (
                <Card key={homework.id} className={isExpired ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getHomeworkTypeIcon(homework.type)}
                      <CardTitle className="text-base">{homework.title}</CardTitle>
                    </div>
                    <CardDescription>
                      <div className="flex justify-between items-center">
                        <span>
                          {!isExpired ? (
                            <>{t("due")} {new Date(homework.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60))} {t("hours")})</>
                          ) : (
                            <span className="text-red-500">{t("expired")}</span>
                          )}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {getClassName(homework.classId)}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{homework.description}</p>
                    <p className="text-sm font-medium">
                      {t("reward")}: <span className="text-amber-500">{homework.coinReward} {t("coins")}</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    {submitted ? (
                      <div className="w-full">
                        <div className={`text-sm px-3 py-2 rounded-md w-full text-center ${
                          status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {status === "approved" 
                            ? t("submission-approved") 
                            : status === "rejected"
                            ? t("submission-rejected")
                            : t("submission-pending")}
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        disabled={isExpired}
                        onClick={() => {
                          setSelectedHomework(homework);
                          setIsSubmitOpen(true);
                          // Reset recording states
                          setAudioBlob(null);
                          setAudioURL(null);
                          setSelectedFile(null);
                        }}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        {t("submit-answer")}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Submit Homework Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={(open) => {
        setIsSubmitOpen(open);
        if (!open && isRecording) {
          stopRecording();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("submit-homework")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedHomework && (
              <>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium">{selectedHomework.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{selectedHomework.description}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {selectedHomework.type === "image" 
                      ? t("upload-image") 
                      : selectedHomework.type === "audio"
                      ? t("upload-or-record-audio")
                      : t("upload-file")}
                  </p>
                  
                  {selectedHomework.type === "audio" && (
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
                  
                  {(!audioURL || selectedHomework.type !== "audio") && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept={
                          selectedHomework.type === "image" 
                            ? "image/*" 
                            : selectedHomework.type === "audio"
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
                          {selectedHomework.type === "image" ? (
                            <Image className="h-6 w-6 text-blue-600" />
                          ) : selectedHomework.type === "audio" ? (
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
            <Button variant="outline" onClick={() => {
              setIsSubmitOpen(false);
              if (isRecording) {
                stopRecording();
              }
            }}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmitHomework} disabled={!selectedFile && !audioBlob}>
              <Send className="h-4 w-4 mr-2" />
              {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HomeworkTab;
