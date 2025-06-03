
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { StudentSelection } from "./types";

export const useHomeworkUIState = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "review">("active");
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [isGiveCoinsOpen, setIsGiveCoinsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSelection | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClassName, setSelectedClassName] = useState<string>("");

  const handleGiveCoins = (amount: number) => {
    if (!selectedStudent) return;
    
    // Award coins to student (implement this function)
    // awardCoinsToStudent(selectedStudent.id, amount);
    
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

  return {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    setSelectedStudent,
    selectedClassId,
    selectedClassName,
    setSelectedClassName,
    handleGiveCoins,
    handleCreateHomework
  };
};
