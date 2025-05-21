
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createClass } from "@/utils/classSync/classOperations";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SelectSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
}

export const SelectSchoolDialog = ({ open, onOpenChange, teacherId }: SelectSchoolDialogProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [newClass, setNewClass] = useState({
    name: "",
    description: ""
  });
  const [creatingClass, setCreatingClass] = useState(false);

  // Fetch schools from Supabase
  useEffect(() => {
    if (open) {
      fetchSchools();
    }
  }, [open]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Get schools data from Supabase
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Schools fetched:", data);
      setSchools(data || []);
      
      // Auto-select first school if available
      if (data && data.length > 0) {
        setSelectedSchoolId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      
      // Try to load from localStorage as fallback
      try {
        const storedSchools = localStorage.getItem("schools");
        if (storedSchools) {
          const parsedSchools = JSON.parse(storedSchools);
          setSchools(parsedSchools);
          
          // Auto-select first school if available
          if (parsedSchools.length > 0) {
            setSelectedSchoolId(parsedSchools[0].id);
          }
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleCreateClass = async () => {
    if (!selectedSchoolId) {
      toast({
        title: t("error"),
        description: t("select-school-first"),
        variant: "destructive"
      });
      return;
    }

    if (!newClass.name.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }

    setCreatingClass(true);
    try {
      console.log("Creating class in school:", selectedSchoolId);
      
      const currentTime = new Date().toISOString();
      
      const classData = {
        name: newClass.name,
        description: newClass.description,
        schoolId: selectedSchoolId,
        teacherId: teacherId,
        students: [],
        isPublic: true,
        likes: [],
        createdAt: currentTime,
        updatedAt: currentTime
      };

      const createdClass = await createClass(classData);
      
      if (createdClass) {
        toast({
          title: t("success"),
          description: t("class-created-successfully")
        });
        
        // Close dialog
        onOpenChange(false);
        
        // Reset form
        setNewClass({
          name: "",
          description: ""
        });
        
        // Navigate to class details
        navigate(`/class-details/${createdClass.id}`);
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
    } finally {
      setCreatingClass(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <School className="h-5 w-5 mr-2" />
            {t("create-new-class")}
          </DialogTitle>
          <DialogDescription>
            {t("select-school-and-create-class")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">{t("create-class")}</TabsTrigger>
            <TabsTrigger value="schools">{t("view-schools")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school">{t("select-school")}</Label>
              <Select 
                value={selectedSchoolId} 
                onValueChange={handleSelectSchool}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? t("loading-schools") : t("select-school")} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </TabsContent>
          
          <TabsContent value="schools" className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <p className="text-center py-4">{t("loading-schools")}...</p>
            ) : schools.length > 0 ? (
              <div className="space-y-2">
                {schools.map((school) => (
                  <div 
                    key={school.id}
                    className={`p-3 border rounded flex items-center justify-between cursor-pointer ${
                      selectedSchoolId === school.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => handleSelectSchool(school.id)}
                  >
                    <div className="flex items-center">
                      <School className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{school.name}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSchoolId(school.id);
                        document.getElementById("create-tab")?.click();
                      }}
                    >
                      {t("select")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">{t("no-schools-available")}</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleCreateClass} 
            disabled={creatingClass || !selectedSchoolId || !newClass.name.trim()}
            className="ml-2"
          >
            {creatingClass ? t("creating") : t("create-class")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
