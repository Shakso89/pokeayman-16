
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface SelectSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
}

export const SelectSchoolDialog: React.FC<SelectSchoolDialogProps> = ({
  open,
  onOpenChange,
  teacherId
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [step, setStep] = useState<"selectSchool" | "createClass">("selectSchool");
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSchools();
      setStep("selectSchool");
      setSelectedSchoolId(null);
      setClassName("");
      setClassDescription("");
    }
  }, [open]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      
      // Fallback to localStorage
      try {
        const savedSchools = localStorage.getItem("schools");
        if (savedSchools) {
          const schoolsData = JSON.parse(savedSchools);
          setSchools(schoolsData);
        }
      } catch (localError) {
        console.error("Error accessing localStorage:", localError);
        toast({
          title: t("error"),
          description: t("failed-to-load-schools"),
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleContinue = () => {
    if (!selectedSchoolId) return;
    setStep("createClass");
  };

  const handleBack = () => {
    setStep("selectSchool");
  };

  const handleCreateClass = async () => {
    if (!selectedSchoolId || !className.trim()) {
      toast({
        title: t("error"),
        description: t("class-name-required"),
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const newClassId = uuidv4();
      const newClass = {
        id: newClassId,
        name: className.trim(),
        description: classDescription.trim(),
        school_id: selectedSchoolId,
        teacher_id: teacherId,
        students: [],
        is_public: true,
        created_at: new Date().toISOString()
      };
      
      // Create class in Supabase
      const { error } = await supabase
        .from('classes')
        .insert(newClass);
        
      if (error) throw error;
      
      // Store in localStorage as fallback
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        existingClasses.push(newClass);
        localStorage.setItem("classes", JSON.stringify(existingClasses));
      } catch (err) {
        console.error("Error updating localStorage:", err);
      }
      
      toast({
        title: t("success"),
        description: t("class-created-successfully")
      });
      
      // Navigate to the class details page
      navigate(`/class-details/${newClassId}`);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-create-class"),
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filter schools based on search query
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "selectSchool" ? t("select-school") : t("create-class")}
          </DialogTitle>
          <DialogDescription>
            {step === "selectSchool" 
              ? t("select-school-to-create-class")
              : t("create-class-in-selected-school")}
          </DialogDescription>
        </DialogHeader>
        
        {step === "selectSchool" ? (
          <>
            <div className="my-4">
              <Label htmlFor="searchSchool">{t("search-schools")}</Label>
              <Input 
                id="searchSchool"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search-school-name")}
                className="mt-1"
              />
            </div>
            
            <div className="max-h-[40vh] overflow-y-auto py-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSchools.length > 0 ? (
                <div className="space-y-2">
                  {filteredSchools.map(school => (
                    <Card
                      key={school.id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedSchoolId === school.id ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      <div className="flex items-center">
                        <School className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <p className="font-medium">{school.name}</p>
                          <p className="text-xs text-gray-500">ID: {school.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? t("no-matching-schools") : t("no-schools-available")}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedSchoolId}
              >
                {t("continue")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="className" className="text-base font-medium">
                  {t("class-name")}
                </Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={t("enter-class-name")}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="classDescription" className="text-base font-medium">
                  {t("class-description")} ({t("optional")})
                </Label>
                <Input
                  id="classDescription"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder={t("enter-class-description")}
                  className="mt-1"
                />
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  {t("selected-school")}: {schools.find(s => s.id === selectedSchoolId)?.name}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isCreating}
              >
                {t("back")}
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={isCreating || !className.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("creating")}...
                  </>
                ) : (
                  t("create-class")
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
