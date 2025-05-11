
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileText, Image, Mic, Check, X, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { awardCoinsToStudent } from "@/utils/pokemon";
import CreateHomeworkDialog from "./CreateHomeworkDialog";

interface HomeworkManagementProps {
  onBack: () => void;
  teacherId: string;
}

const HomeworkManagement: React.FC<HomeworkManagementProps> = ({ onBack, teacherId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  
  // Load data
  useEffect(() => {
    if (teacherId) {
      loadHomeworkData();
      loadClassesData();
    }
  }, [teacherId]);

  const loadHomeworkData = () => {
    // Load homework assignments
    const assignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    setHomeworkAssignments(assignments.filter((hw: HomeworkAssignment) => hw.teacherId === teacherId));
    
    // Load homework submissions
    const submissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    setHomeworkSubmissions(submissions);
  };
  
  const loadClassesData = () => {
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    // Filter for teacher's classes
    const teacherClasses = allClasses.filter((cls: any) => cls.teacherId === teacherId);
    setClasses(teacherClasses.map((cls: any) => ({ id: cls.id, name: cls.name })));
  };

  const handleHomeworkCreated = (homework: HomeworkAssignment) => {
    setHomeworkAssignments([...homeworkAssignments, homework]);
  };

  const handleApproveSubmission = (submission: HomeworkSubmission) => {
    // Find the homework to get the reward amount
    const homework = homeworkAssignments.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    // Update submission status
    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === submission.id) {
        return { ...sub, status: "approved" };
      }
      return sub;
    });
    
    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    setHomeworkSubmissions(updatedSubmissions);
    
    // Award coins to student
    awardCoinsToStudent(submission.studentId, homework.coinReward);
    
    toast({
      title: t("success"),
      description: `${t("submission-approved")} ${homework.coinReward} ${t("coins-awarded")}`,
    });
  };

  const handleRejectSubmission = (submission: HomeworkSubmission) => {
    // Update submission status
    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === submission.id) {
        return { ...sub, status: "rejected" };
      }
      return sub;
    });
    
    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    setHomeworkSubmissions(updatedSubmissions);
    
    toast({
      title: t("submission-rejected"),
      description: t("no-coins-awarded"),
    });
  };
  
  const handleDeleteHomework = (homeworkId: string) => {
    // Remove homework assignment
    const filteredAssignments = homeworkAssignments.filter(hw => hw.id !== homeworkId);
    localStorage.setItem("homeworkAssignments", JSON.stringify(filteredAssignments));
    
    // Remove associated submissions
    const filteredSubmissions = homeworkSubmissions.filter(sub => sub.homeworkId !== homeworkId);
    localStorage.setItem("homeworkSubmissions", JSON.stringify(filteredSubmissions));
    
    // Update state
    setHomeworkAssignments(filteredAssignments);
    setHomeworkSubmissions(filteredSubmissions);
    
    toast({
      title: t("homework-deleted"),
      description: t("homework-submissions-deleted"),
    });
  };

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);
  const archivedHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) <= now);
  
  // Get class name by ID
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : t("unknown-class");
  };

  // Get submissions for a specific homework
  const getSubmissionsForHomework = (homeworkId: string) => {
    return homeworkSubmissions.filter(sub => sub.homeworkId === homeworkId);
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

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold flex-1">{t("homework-management")}</h2>
        <Button onClick={() => setIsCreateHomeworkOpen(true)}>
          {t("create-homework")}
        </Button>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archived")}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">{t("active-homework")}</TabsTrigger>
          <TabsTrigger value="archived">{t("archived-homework")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeHomework.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{t("no-active-homework")}</p>
                <Button onClick={() => setIsCreateHomeworkOpen(true)} className="mt-4">
                  {t("create-homework")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeHomework.map(homework => {
                const submissions = getSubmissionsForHomework(homework.id);
                return (
                  <Card key={homework.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getHomeworkTypeIcon(homework.type)}
                          <CardTitle className="ml-2">{homework.title}</CardTitle>
                        </div>
                        <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                          {getClassName(homework.classId)}
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {new Date(homework.createdAt).toLocaleDateString()} - {t("expires-in")} {Math.ceil((new Date(homework.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60))} {t("hours")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{homework.description}</p>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium mb-2">{t("submissions")}: {submissions.length}</p>
                        {submissions.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {submissions.map(submission => (
                              <div key={submission.id} className="bg-white p-2 rounded border flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{submission.studentName}</p>
                                  <p className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</p>
                                </div>
                                {submission.status === "pending" ? (
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="outline" onClick={() => window.open(submission.content, '_blank')}>
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleRejectSubmission(submission)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-green-500" onClick={() => handleApproveSubmission(submission)}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-xs ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {submission.status === 'approved' ? t("approved") : t("rejected")}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">{t("no-submissions-yet")}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{t("reward")}:</span> {homework.coinReward} {t("coins")}
                      </div>
                      <Button variant="outline" className="text-red-500" onClick={() => handleDeleteHomework(homework.id)}>
                        {t("delete")}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived">
          {archivedHomework.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{t("no-archived-homework")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archivedHomework.map(homework => {
                const submissions = getSubmissionsForHomework(homework.id);
                const approvedSubmissions = submissions.filter(sub => sub.status === "approved");
                
                return (
                  <Card key={homework.id} className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getHomeworkTypeIcon(homework.type)}
                          <CardTitle className="ml-2 text-gray-600">{homework.title}</CardTitle>
                        </div>
                        <div className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium">
                          {getClassName(homework.classId)}
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {t("expired")}: {new Date(homework.expiresAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{t("submissions")}: {submissions.length}</p>
                      <p className="text-sm text-gray-600">{t("approved")}: {approvedSubmissions.length}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" onClick={() => handleDeleteHomework(homework.id)}>
                        {t("delete-permanently")}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <CreateHomeworkDialog
        open={isCreateHomeworkOpen}
        onOpenChange={setIsCreateHomeworkOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classes={classes}
      />
    </div>
  );
};

export default HomeworkManagement;
