import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Award, BookText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import CreateHomeworkDialog from "@/components/homework/CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import ManagePokemonDialog from "@/components/dialogs/ManagePokemonDialog";
import { awardCoinsToStudent } from "@/services/studentCoinService";
import { useToast } from "@/hooks/use-toast";

interface ManageClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  students: Array<{
    id: string;
    displayName: string;
    username: string;
    schoolId?: string;
  }>;
  teacherId: string;
}

const ManageClassDialog: React.FC<ManageClassDialogProps> = ({
  open,
  onOpenChange,
  classId,
  className,
  students,
  teacherId
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("coins");
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [giveCoinsDialog, setGiveCoinsDialog] = useState({
    open: false,
    studentId: "",
    studentName: ""
  });
  const [managePokemonDialog, setManagePokemonDialog] = useState({
    open: false,
    studentId: "",
    studentName: "",
    schoolId: ""
  });

  const schoolId = students.length > 0 ? students[0].schoolId : undefined;

  // Handle homework creation
  const handleHomeworkCreated = () => {
    toast({
      title: t("success"),
      description: t("homework-created-successfully")
    });
  };

  // Handle giving coins to a student
  const handleGiveCoins = (amount: number) => {
    if (!giveCoinsDialog.studentId) return;
    
    try {
      awardCoinsToStudent(giveCoinsDialog.studentId, amount);
      
      toast({
        title: t("success"),
        description: `${amount} ${t("coins-awarded-to")} ${giveCoinsDialog.studentName}`
      });
      
      setGiveCoinsDialog({ open: false, studentId: "", studentName: "" });
    } catch (error) {
      console.error("Error giving coins:", error);
      toast({
        title: t("error"),
        description: t("failed-to-give-coins"),
        variant: "destructive"
      });
    }
  };

  // Handle Pokemon removal
  const handlePokemonRemoved = () => {
    toast({
      title: t("success"),
      description: t("pokemon-removed-successfully")
    });
  };

  // Handle class-wide homework creation
  const handleCreateClassHomework = () => {
    setIsCreateHomeworkOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("manage-class")} - {className}</DialogTitle>
          <DialogDescription>
            {t("manage-class-description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="coins" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {t("coins")}
            </TabsTrigger>
            <TabsTrigger value="pokemon" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t("pokemon")}
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              {t("homework")}
            </TabsTrigger>
          </TabsList>

          {/* Coins Management Tab */}
          <TabsContent value="coins">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Button onClick={handleCreateClassHomework}>
                  {t("award-coins-to-all-students")}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">{t("students")}</h3>
                {students.length > 0 ? (
                  students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.displayName}</p>
                        <p className="text-sm text-gray-500">@{student.username}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setGiveCoinsDialog({
                          open: true, 
                          studentId: student.id,
                          studentName: student.displayName || student.username
                        })}
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        {t("give-coins")}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">{t("no-students-in-class")}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pokemon Management Tab */}
          <TabsContent value="pokemon">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">{t("students")}</h3>
                {students.length > 0 ? (
                  students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.displayName}</p>
                        <p className="text-sm text-gray-500">@{student.username}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setManagePokemonDialog({
                          open: true, 
                          studentId: student.id,
                          studentName: student.displayName || student.username,
                          schoolId: student.schoolId || ""
                        })}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        {t("manage-pokemon")}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">{t("no-students-in-class")}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Homework Management Tab */}
          <TabsContent value="homework">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Button onClick={handleCreateClassHomework}>
                  <BookText className="h-4 w-4 mr-1" />
                  {t("create-homework-for-class")}
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>{t("homework-instructions")}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Create Homework Dialog */}
      <CreateHomeworkDialog
        open={isCreateHomeworkOpen}
        onOpenChange={setIsCreateHomeworkOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classId={classId}
      />

      {/* Give Coins Dialog */}
      <GiveCoinsDialog
        isOpen={giveCoinsDialog.open}
        onOpenChange={(open) => setGiveCoinsDialog({...giveCoinsDialog, open})}
        studentName={giveCoinsDialog.studentName}
        studentId={giveCoinsDialog.studentId}
        onGiveCoins={handleGiveCoins}
        teacherId={teacherId}
        classId={classId}
        schoolId={schoolId}
      />

      {/* Manage Pokemon Dialog */}
      <ManagePokemonDialog
        open={managePokemonDialog.open}
        onOpenChange={(open) => setManagePokemonDialog({...managePokemonDialog, open})}
        studentId={managePokemonDialog.studentId}
        studentName={managePokemonDialog.studentName}
        onPokemonUpdated={handlePokemonRemoved}
      />
    </Dialog>
  );
};

export default ManageClassDialog;
