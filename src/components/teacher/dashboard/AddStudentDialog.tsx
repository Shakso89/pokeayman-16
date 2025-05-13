
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/utils/creditService";
import { v4 as uuidv4 } from "uuid";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string | null;
  teacherData: any;
  onTeacherDataUpdate: (newData: any) => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  isOpen,
  onClose,
  teacherId,
  teacherData,
  onTeacherDataUpdate
}) => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Function to ensure teacher ID is a valid UUID
  const getValidUUID = (id: string | null): string => {
    if (!id) return uuidv4(); // Generate a new UUID if id is null
    
    // Check if the ID is already a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    
    // If the ID starts with "teacher-", extract a hash from it to create a consistent UUID
    if (id.startsWith("teacher-")) {
      // Use the teacher ID to deterministically generate a UUID
      // This ensures the same teacher ID always maps to the same UUID
      const teacherNum = id.replace("teacher-", "");
      const namespace = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // A fixed namespace UUID
      
      // Create a UUID based on the teacher number (simplified approach)
      const hash = `${namespace.substring(0, 24)}${teacherNum.substring(0, 12)}`;
      return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    }
    
    // Default fallback - generate a new UUID
    return uuidv4();
  };

  const handleAddStudent = async () => {
    // Validate student data
    if (!studentData.username || !studentData.password || !studentData.displayName) {
      toast({
        title: "Error",
        description: t("fill-all-fields"),
        variant: "destructive"
      });
      return;
    }
    
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get a valid UUID for the teacher ID
      const validTeacherId = getValidUUID(teacherId);
      
      // Try using the edge function to create the student
      const { data: createResponse, error: edgeFunctionError } = await supabase.functions.invoke("create_student", {
        body: {
          username: studentData.username,
          password: studentData.password, 
          displayName: studentData.displayName,
          teacherId: validTeacherId
        }
      });
      
      if (edgeFunctionError) {
        throw new Error(`Edge function error: ${edgeFunctionError.message}`);
      }
      
      if (createResponse.error) {
        throw new Error(createResponse.error);
      }
      
      // Show success message
      toast({
        title: "Success",
        description: t("student-added")
      });
      
      // Reset form and close dialog
      setStudentData({
        username: "",
        password: "",
        displayName: "",
      });
      
      // Update local state
      const updatedTeacherData = { 
        ...teacherData 
      };
      
      if (!updatedTeacherData.students) {
        updatedTeacherData.students = [];
      }
      
      if (createResponse.student) {
        updatedTeacherData.students.push(createResponse.student.id);
        onTeacherDataUpdate(updatedTeacherData);
      }
      
      onClose();
      
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create-student")}</DialogTitle>
          <DialogDescription>
            {t("create-student-desc")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="studentUsername">{t("username")}</Label>
            <Input
              id="studentUsername"
              value={studentData.username}
              onChange={(e) => setStudentData({...studentData, username: e.target.value})}
              placeholder={t("student-username")}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentDisplayName">{t("display-name")}</Label>
            <Input
              id="studentDisplayName"
              value={studentData.displayName}
              onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
              placeholder={t("student-display-name")}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentPassword">{t("password")}</Label>
            <Input
              id="studentPassword"
              type="password"
              value={studentData.password}
              onChange={(e) => setStudentData({...studentData, password: e.target.value})}
              placeholder={t("create-password")}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddStudent} disabled={isLoading}>
            {isLoading ? `${t("creating")}...` : t("create-account")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
