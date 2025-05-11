
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment } from "@/types/homework";
import CreateHomeworkDialog from "./CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import ActiveHomeworkTab from "./homework/ActiveHomeworkTab";
import ArchivedHomeworkTab from "./homework/ArchivedHomeworkTab";

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
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [isGiveCoinsOpen, setIsGiveCoinsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{id: string, name: string} | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  
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

  const handleGiveCoins = (amount: number) => {
    if (!selectedStudent) return;
    
    // Award coins to student
    awardCoinsToStudent(selectedStudent.id, amount);
    
    // Close dialog and reset selected student
    setIsGiveCoinsOpen(false);
    setSelectedStudent(null);
    
    toast({
      title: t("coins-awarded"),
      description: `${amount} ${t("coins-awarded-to")} ${selectedStudent.name}`,
    });
  };
  
  const handleCreateHomework = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setIsCreateHomeworkOpen(true);
  };

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);
  const archivedHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) <= now);

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold flex-1">{t("homework-management")}</h2>
        <Button onClick={() => handleCreateHomework(classes[0]?.id || "", classes[0]?.name || "")}>
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
                <Button onClick={() => handleCreateHomework(classes[0]?.id || "", classes[0]?.name || "")} className="mt-4">
                  {t("create-homework")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ActiveHomeworkTab 
              homeworks={activeHomework} 
              submissions={homeworkSubmissions} 
              classes={classes}
              onAwardCoins={(studentId, studentName) => {
                setSelectedStudent({id: studentId, name: studentName});
                setIsGiveCoinsOpen(true);
              }}
              onDeleteHomework={(homeworkId) => {
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
              }}
            />
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
            <ArchivedHomeworkTab 
              homeworks={archivedHomework} 
              submissions={homeworkSubmissions} 
              classes={classes}
              onDeleteHomework={(homeworkId) => {
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
              }}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <CreateHomeworkDialog
        open={isCreateHomeworkOpen}
        onOpenChange={setIsCreateHomeworkOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classId={selectedClassId}
        className={selectedClassName}
      />

      <GiveCoinsDialog
        open={isGiveCoinsOpen}
        onOpenChange={setIsGiveCoinsOpen}
        onGiveCoins={handleGiveCoins}
      />
    </div>
  );
};

// Add this import at the top
import { awardCoinsToStudent } from "@/utils/pokemon";

export default HomeworkManagement;
