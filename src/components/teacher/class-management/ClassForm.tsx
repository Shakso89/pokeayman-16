import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (directCreateMode) {
      document.getElementById("className")?.focus();
    }
  }, [directCreateMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateClass = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const timestamp = new Date().toISOString();
    const newClass: ClassData = {
      name: formData.name.trim(),
      description: formData.description || "",
      schoolId,
      teacherId: isAdmin ? null : teacherId,
      students: [],
      isPublic: true,
      likes: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    try {
      const created = await createClass(newClass);
      if (created) {
        toast({
          title: t("success"),
          description: t("class-created-successfully")
        });
        setFormData({ name: "", description: "" });
        onClassCreated(created);
      } else {
        throw new Error("Class creation failed");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: t("error"),
        description: t("failed-to-create-class"),
        variant: "destructive"
      });
      onClassCreated(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("create-new-class")}</CardTitle>
        <CardDescription>{t("add-new-class-to")} <strong>{schoolId}</strong></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="className">{t("class-name")}</Label>
          <Input
            id="className"
            placeholder={t("enter-class-name")}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classDescription">
            {t("description")} ({t("optional")})
          </Label>
          <Textarea
            id="classDescription"
            placeholder={t("enter-class-description")}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleCreateClass}
          className="w-full"
          disabled={isLoading || !formData.name.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("creating")}...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t("create-class")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassForm;
