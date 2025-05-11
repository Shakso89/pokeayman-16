
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Mic, FileUp, Send } from "lucide-react";
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
  
  useEffect(() => {
    loadHomeworkData();
  }, [classId]);
  
  const loadHomeworkData = () => {
    // Get all homework assignments
    const allHomeworks = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    
    // Filter for homework assigned to student's class that hasn't expired
    const now = new Date();
    const activeHomeworks = allHomeworks.filter((hw: HomeworkAssignment) => 
      hw.classId === classId && new Date(hw.expiresAt) > now
    );
    
    setHomeworks(activeHomeworks);
    
    // Get all submissions
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    
    // Filter for student's submissions
    const studentSubmissions = allSubmissions.filter((sub: HomeworkSubmission) => 
      sub.studentId === studentId
    );
    
    setSubmissions(studentSubmissions);
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
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("my-homework")}</h2>
      
      {homeworks.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p>{t("no-homework")}</p>
          </CardContent>
        </Card>
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
                    <CardTitle>{homework.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {!isExpired ? (
                      <>{t("due")} {new Date(homework.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60))} {t("hours")})</>
                    ) : (
                      <span className="text-red-500">{t("expired")}</span>
                    )}
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
      
      {/* Submit Homework Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
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
                      ? t("upload-audio")
                      : t("upload-file")}
                  </p>
                  
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
                      
                      {selectedFile ? (
                        <p className="text-blue-600 font-medium">{selectedFile.name}</p>
                      ) : (
                        <p className="text-gray-500">{t("click-to-upload")}</p>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmitHomework} disabled={!selectedFile}>
              <Send className="h-4 w-4 mr-2" />
              {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkTab;
