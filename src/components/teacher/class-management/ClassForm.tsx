
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { createClass } from "@/utils/classSync/classOperations";
import { ClassData } from "@/utils/classSync/types";

interface ClassFormProps {
  schoolId: string;
  teacherId: string;
  isAdmin: boolean;
  onClassCreated: (createdClass: ClassData | null) => void;
  directCreateMode?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
  schoolId,
  teacherId,
  isAdmin,
  onClassCreated,
  directCreateMode = false
}) => {
  const { t } = useTranslation();
  const [newClass, setNewClass] = useState({
    name: "",
    description: ""
  });
  
  // Auto-focus on class creation when in direct create mode
  React.useEffect(() => {
    if (directCreateMode) {
      // If we're in direct create mode, focus on the class name input
      const classNameInput = document.getElementById("className");
      if (classNameInput) {
        classNameInput.focus();
      }
    }
  }, [directCreateMode]);
  
  const handleCreateClass = async () => {
    try {
      if (!newClass.name.trim()) {
        toast({
          title: t("error"),
          description: t("class-name-required"),
          variant: "destructive"
        });
        return;
      }
      
      const currentTime = new Date().toISOString();
      
      // Create class data with required and optional fields matching the ClassData type
      const classData = {
        name: newClass.name,
        description: newClass.description || "",
        schoolId,
        teacherId: isAdmin ? null : teacherId, // Set teacherId to null for admin users
        students: [],
        isPublic: true,
        likes: [],
        createdAt: currentTime,
        updatedAt: currentTime
      };
      
      console.log("Creating class with data:", classData);
      
      const createdClass = await createClass(classData);
      
      if (createdClass) {
        toast({
          title: t("success"),
          description: t("class-created-successfully")
        });
        
        // Clear form
        setNewClass({ name: "", description: "" });
        
        // Notify parent component
        onClassCreated(createdClass);
      } else {
        throw new Error("Failed to create class");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-create-class"),
        variant: "destructive"
      });
      
      // Notify parent with null to indicate failure
      onClassCreated(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("create-new-class")}</CardTitle>
        <CardDescription>{t("add-new-class-to")} {schoolId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="className">{t("class-name")}</Label>
          <Input 
            id="className"
            placeholder={t("enter-class-name")} 
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classDescription">{t("description")} ({t("optional")})</Label>
          <Textarea 
            id="classDescription"
            placeholder={t("enter-class-description")} 
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateClass}
          className="w-full"
          disabled={!newClass.name.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("create-class")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassForm;
