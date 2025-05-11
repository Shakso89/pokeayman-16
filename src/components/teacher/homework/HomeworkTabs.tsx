
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeworkAssignment } from "@/types/homework";
import ActiveHomeworkTab from "./ActiveHomeworkTab";
import ArchivedHomeworkTab from "./ArchivedHomeworkTab";

interface HomeworkTabsProps {
  activeTab: "active" | "archived";
  onTabChange: (value: "active" | "archived") => void;
  activeHomework: HomeworkAssignment[];
  archivedHomework: HomeworkAssignment[];
  submissions: any[];
  classes: Array<{ id: string; name: string }>;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onCreateHomework: (classId: string, className: string) => void;
}

const HomeworkTabs: React.FC<HomeworkTabsProps> = ({
  activeTab,
  onTabChange,
  activeHomework,
  archivedHomework,
  submissions,
  classes,
  onAwardCoins,
  onDeleteHomework,
  onCreateHomework,
}) => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="active" value={activeTab} onValueChange={(value) => onTabChange(value as "active" | "archived")}>
      <TabsList className="mb-6">
        <TabsTrigger value="active">{t("active-homework")}</TabsTrigger>
        <TabsTrigger value="archived">{t("archived-homework")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        {activeHomework.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>{t("no-active-homework")}</p>
              <Button onClick={() => onCreateHomework(classes[0]?.id || "", classes[0]?.name || "")} className="mt-4">
                {t("create-homework")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ActiveHomeworkTab 
            homeworks={activeHomework} 
            submissions={submissions} 
            classes={classes}
            onAwardCoins={onAwardCoins}
            onDeleteHomework={onDeleteHomework}
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
            submissions={submissions} 
            classes={classes}
            onDeleteHomework={onDeleteHomework}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default HomeworkTabs;
