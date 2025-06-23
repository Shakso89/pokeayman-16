
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { School, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { createClass } from "@/utils/classSync/classOperations";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SelectSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  onClassCreated?: () => void;
}

export function SelectSchoolDialog({ 
  open, 
  onOpenChange, 
  teacherId,
  onClassCreated
}: SelectSchoolDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // For creating a class
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    school_id: ""
  });
  const [creatingClass, setCreatingClass] = useState(false);
  
  // Load schools when dialog opens
  useEffect(() => {
    if (open) {
      fetchSchools();
      // Reset form when dialog opens
      setNewClass({
        name: "",
        description: "",
        school_id: ""
      });
    }
  }, [open]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      // Try to load from localStorage as fallback
      const localSchools = localStorage.getItem("schools");
      if (localSchools) {
        try {
          setSchools(JSON.parse(localSchools));
        } catch (parseError) {
          console.error("Error parsing local schools:", parseError);
          setSchools([]);
        }
      } else {
        setSchools([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateClass = async () => {
    if (!newClass.name.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }
    
    if (!newClass.school_id) {
      toast({
        title: t("error"),
        description: t("select-school-first"),
        variant: "destructive"
      });
      return;
    }
    
    setCreatingClass(true);
    
    try {
      const currentTime = new Date().toISOString();
      
      // Create class data with required and optional fields
      const classData = {
        name: newClass.name.trim(),
        description: newClass.description.trim() || "",
        school_id: newClass.school_id,
        teacher_id: teacherId, // Always assign the creator as the teacher
        students: [],
        is_public: true,
        likes: [],
        assistants: [],
        created_at: currentTime,
        updated_at: currentTime
      };
      
      console.log("Creating class with data:", classData);
      
      const createdClass = await createClass(classData);
      
      if (createdClass) {
        toast({
          title: t("success"),
          description: t("class-created-successfully")
        });
        
        // Reset form
        setNewClass({ name: "", description: "", school_id: "" });
        
        // Close dialog
        onOpenChange(false);
        
        // Navigate to the class details page
        navigate(`/class-details/${createdClass.id}`);
        
        // Call onClassCreated callback if provided
        if (onClassCreated) {
          onClassCreated();
        }
      } else {
        throw new Error("Failed to create class - createClass returned null");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("failed-to-create-class"),
        variant: "destructive"
      });
    } finally {
      setCreatingClass(false);
    }
  };
  
  const filteredSchools = searchQuery
    ? schools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : schools;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create-class")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* School selection for new class */}
          <div className="space-y-2">
            <Label htmlFor="school">{t("select-school")}</Label>
            <div className="relative mb-4">
              <Input
                placeholder={t("search-schools")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[20vh] overflow-y-auto space-y-2">
              {loading ? (
                <div className="py-3 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map(school => (
                  <Button
                    key={school.id}
                    variant={newClass.school_id === school.id ? "default" : "outline"}
                    className="w-full justify-start text-left flex items-center"
                    onClick={() => setNewClass({...newClass, school_id: school.id})}
                  >
                    <School className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{school.name}</span>
                  </Button>
                ))
              ) : (
                <div className="py-3 text-center text-gray-500">
                  {t("no-schools-available")}
                </div>
              )}
            </div>
          </div>
          
          {/* Class name and description inputs */}
          <div className="space-y-2">
            <Label htmlFor="className">{t("class-name")}</Label>
            <Input 
              id="className"
              placeholder={t("enter-class-name")}
              value={newClass.name}
              onChange={(e) => setNewClass({...newClass, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="classDescription">{t("description")} ({t("optional")})</Label>
            <Textarea 
              id="classDescription"
              placeholder={t("enter-class-description")}
              value={newClass.description}
              onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <Button 
            className="w-full bg-pokemon-red hover:bg-red-600 text-white" 
            onClick={handleCreateClass}
            disabled={!newClass.name || !newClass.school_id || creatingClass}
          >
            {creatingClass ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("creating")}...
              </>
            ) : (
              t("create-class")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
