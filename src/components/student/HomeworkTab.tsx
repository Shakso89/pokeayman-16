
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import HomeworkList from "./homework/HomeworkList";
import SubmitHomeworkDialog from "./homework/SubmitHomeworkDialog";
import ViewSubmissionDialog from "./homework/ViewSubmissionDialog";
import { readFileAsDataURL } from "./homework/utils";

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
  const [classes, setClasses] = useState<{[id: string]: string}>({});
  const [viewSubmission, setViewSubmission] = useState<HomeworkSubmission | null>(null);
  
  useEffect(() => {
    loadHomeworkData();
    loadClassesData();
  }, [classId]);
  
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
  
  const handleOpenSubmission = (homeworkId: string) => {
    const submission = submissions.find(sub => sub.homeworkId === homeworkId);
    if (submission) {
      setViewSubmission(submission);
    }
  };
  
  const handleOpenSubmitDialog = (homework: HomeworkAssignment) => {
    setSelectedHomework(homework);
    setIsSubmitOpen(true);
  };
  
  const handleSubmitHomework = async (file: File) => {
    if (!selectedHomework) {
      toast({
        title: t("error"),
        description: t("homework-not-selected"),
        variant: "destructive"
      });
      return;
    }
    
    try {
      // For a real app, we would upload to a server
      // For this demo, we'll create a data URL
      const fileContent = await readFileAsDataURL(file);
      
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
  
  const now = new Date();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("my-homework")}</CardTitle>
        <CardDescription>{t("homework-description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <HomeworkList 
          homeworks={homeworks}
          submissions={submissions}
          classes={classes}
          onSubmit={handleOpenSubmitDialog}
          onViewSubmission={handleOpenSubmission}
          now={now}
        />
      </CardContent>
      
      {/* Dialogs */}
      <SubmitHomeworkDialog 
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        homework={selectedHomework}
        onSubmit={handleSubmitHomework}
      />
      
      <ViewSubmissionDialog 
        submission={viewSubmission}
        onClose={() => setViewSubmission(null)}
      />
    </Card>
  );
};

export default HomeworkTab;
