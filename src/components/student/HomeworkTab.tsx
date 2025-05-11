
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, Mic, Upload, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";

interface HomeworkTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({ 
  studentId,
  studentName,
  classId
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [submissionText, setSubmissionText] = useState<string>("");
  const [submissionImage, setSubmissionImage] = useState<File | null>(null);
  const [submissionAudio, setSubmissionAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Load data
  useEffect(() => {
    loadHomeworkData();
  }, [studentId, classId]);

  const loadHomeworkData = () => {
    const now = new Date();
    
    // Load homework assignments for this class that haven't expired
    const allAssignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    const activeAssignments = allAssignments.filter((hw: HomeworkAssignment) => 
      hw.classId === classId && new Date(hw.expiresAt) > now
    );
    setHomeworkAssignments(activeAssignments);
    
    // Load student's submissions
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    const studentSubmissions = allSubmissions.filter((sub: HomeworkSubmission) => 
      sub.studentId === studentId
    );
    setSubmissions(studentSubmissions);
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
        setAudioChunks([...chunks]);
      };
      
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: t("recording"),
        description: t("recording-in-progress"),
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: t("error"),
        description: t("microphone-access-denied"),
        variant: "destructive",
      });
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Clean up media recorder and stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: t("recording-stopped"),
        description: t("recording-ready"),
      });
    }
  };

  // Handle file selection for image submission
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionImage(e.target.files[0]);
    }
  };

  // Submit homework
  const handleSubmitHomework = async (homework: HomeworkAssignment) => {
    // Check if already submitted
    const existingSubmission = submissions.find(sub => sub.homeworkId === homework.id);
    if (existingSubmission) {
      toast({
        title: t("already-submitted"),
        description: t("cannot-submit-again"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      let content = "";
      let type = homework.type;
      
      // Handle different submission types
      if (homework.type === "text") {
        if (!submissionText.trim()) {
          toast({
            title: t("error"),
            description: t("enter-answer"),
            variant: "destructive",
          });
          return;
        }
        content = submissionText;
      } 
      else if (homework.type === "image") {
        if (!submissionImage) {
          toast({
            title: t("error"),
            description: t("select-image"),
            variant: "destructive",
          });
          return;
        }
        
        // Create data URL for the image
        content = URL.createObjectURL(submissionImage);
      } 
      else if (homework.type === "audio") {
        if (!audioChunks.length) {
          toast({
            title: t("error"),
            description: t("record-audio"),
            variant: "destructive",
          });
          return;
        }
        
        // Create audio blob and data URL
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        content = URL.createObjectURL(audioBlob);
      }
      
      // Create new submission
      const newSubmission: HomeworkSubmission = {
        id: `sub-${Date.now()}`,
        homeworkId: homework.id,
        studentId,
        studentName,
        content,
        type,
        submittedAt: new Date().toISOString(),
        status: "pending"
      };
      
      // Save submission to localStorage
      const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
      allSubmissions.push(newSubmission);
      localStorage.setItem("homeworkSubmissions", JSON.stringify(allSubmissions));
      
      // Update local state
      setSubmissions([...submissions, newSubmission]);
      
      // Reset form state
      setSubmissionText("");
      setSubmissionImage(null);
      setSubmissionAudio(null);
      setAudioChunks([]);
      
      toast({
        title: t("success"),
        description: t("homework-submitted"),
      });
      
      // Switch to submitted tab
      setActiveTab("submitted");
      
    } catch (error) {
      console.error("Error submitting homework:", error);
      toast({
        title: t("error"),
        description: t("submission-failed"),
        variant: "destructive",
      });
    }
  };
  
  // Get icon for homework type
  const getHomeworkTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-5 w-5 text-blue-500" />;
      case "image": return <Image className="h-5 w-5 text-green-500" />;
      case "audio": return <Mic className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Filter homework that hasn't been submitted yet
  const pendingHomework = homeworkAssignments.filter(hw => 
    !submissions.some(sub => sub.homeworkId === hw.id)
  );
  
  // Get submission for a homework
  const getSubmissionForHomework = (homeworkId: string) => {
    return submissions.find(sub => sub.homeworkId === homeworkId);
  };
  
  // Get homework by ID
  const getHomeworkById = (homeworkId: string) => {
    return homeworkAssignments.find(hw => hw.id === homeworkId);
  };

  return (
    <div>
      <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "submitted")}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            {t("pending-homework")}
            {pendingHomework.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingHomework.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted">{t("submitted-homework")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingHomework.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{t("no-pending-homework")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingHomework.map(homework => (
                <Card key={homework.id}>
                  <CardHeader>
                    <div className="flex items-center">
                      {getHomeworkTypeIcon(homework.type)}
                      <CardTitle className="ml-2">{homework.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {t("due")} {new Date(homework.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(homework.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))} {t("hours-left")})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{homework.description}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      {homework.type === "text" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">{t("your-answer")}:</label>
                          <Textarea
                            placeholder={t("type-your-answer")}
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={4}
                          />
                        </div>
                      )}
                      
                      {homework.type === "image" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium">{t("upload-image")}:</label>
                          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                            {submissionImage ? (
                              <div className="text-center">
                                <img
                                  src={URL.createObjectURL(submissionImage)}
                                  alt="Preview"
                                  className="max-h-48 mx-auto mb-2"
                                />
                                <p className="text-sm">{submissionImage.name}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setSubmissionImage(null)}
                                >
                                  {t("remove")}
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">{t("click-to-upload")}</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={handleImageChange}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {homework.type === "audio" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium">{t("record-audio")}:</label>
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                            {audioChunks.length > 0 ? (
                              <div className="text-center">
                                <Mic className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p>{t("audio-recorded")}</p>
                                <audio controls className="mt-2">
                                  <source src={URL.createObjectURL(new Blob(audioChunks, { type: "audio/webm" }))} />
                                </audio>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setAudioChunks([])}
                                >
                                  {t("record-again")}
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Mic className={`h-8 w-8 mx-auto mb-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                                {isRecording ? (
                                  <Button onClick={stopRecording} variant="destructive" size="sm">
                                    {t("stop-recording")}
                                  </Button>
                                ) : (
                                  <Button onClick={startRecording} size="sm">
                                    {t("start-recording")}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium">{t("reward")}:</span> {homework.coinReward} {t("coins")}
                        </div>
                        <Button onClick={() => handleSubmitHomework(homework)}>
                          {t("submit-homework")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="submitted">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{t("no-submitted-homework")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map(submission => {
                const homework = getHomeworkById(submission.homeworkId);
                if (!homework) return null;
                
                return (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getHomeworkTypeIcon(homework.type)}
                          <CardTitle className="ml-2">{homework.title}</CardTitle>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status === 'approved' 
                            ? t("approved") 
                            : submission.status === 'rejected' 
                            ? t("rejected") 
                            : t("pending")}
                        </div>
                      </div>
                      <CardDescription className="mt-1">
                        {t("submitted")}: {new Date(submission.submittedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{homework.description}</p>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm font-medium mb-2">{t("your-submission")}:</p>
                        
                        {submission.type === "text" && (
                          <p className="bg-white p-3 rounded border">{submission.content}</p>
                        )}
                        
                        {submission.type === "image" && (
                          <div className="text-center bg-white p-3 rounded border">
                            <img src={submission.content} alt="Submission" className="max-h-48 mx-auto" />
                          </div>
                        )}
                        
                        {submission.type === "audio" && (
                          <div className="text-center bg-white p-3 rounded border">
                            <audio controls className="w-full">
                              <source src={submission.content} />
                            </audio>
                          </div>
                        )}
                        
                        {submission.status === 'approved' && (
                          <div className="flex items-center justify-between mt-3 p-2 bg-green-50 text-green-700 rounded">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              <span>{t("reward-received")}</span>
                            </div>
                            <span className="font-medium">{homework.coinReward} {t("coins")}</span>
                          </div>
                        )}
                        
                        {submission.status === 'rejected' && (
                          <div className="flex items-center mt-3 p-2 bg-red-50 text-red-700 rounded">
                            <X className="h-4 w-4 mr-1" />
                            <span>{t("submission-rejected")}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeworkTab;
