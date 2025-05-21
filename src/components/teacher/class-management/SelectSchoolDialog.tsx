
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { School, Search, Loader2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"select" | "create">("select");
  
  // For creating a class
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    schoolId: ""
  });
  const [creatingClass, setCreatingClass] = useState(false);
  
  // Load schools when dialog opens
  useEffect(() => {
    if (open) {
      fetchSchools();
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

  const handleSelectSchool = (schoolId: string) => {
    // For the create tab, just set the school ID
    if (activeTab === "create") {
      setNewClass({ ...newClass, schoolId });
    } else {
      // For select tab, navigate to create class page with this school
      navigate(`/create-class/${schoolId}`);
      onOpenChange(false);
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
    
    if (!newClass.schoolId) {
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
        name: newClass.name,
        description: newClass.description || "",
        schoolId: newClass.schoolId,
        teacherId, // Use the teacherId passed to the component
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
        
        // Reset form
        setNewClass({ name: "", description: "", schoolId: "" });
        
        // Close dialog
        onOpenChange(false);
        
        // Navigate to the class details page
        navigate(`/class-details/${createdClass.id}`);
        
        // Call onClassCreated callback if provided
        if (onClassCreated) {
          onClassCreated();
        }
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
          <DialogTitle>{t("select-school-or-create-class")}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "select" | "create")}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="select" className="w-1/2">{t("select-school")}</TabsTrigger>
            <TabsTrigger value="create" className="w-1/2">{t("create-class")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder={t("search-schools")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSchools.length > 0 ? (
                <div className="max-h-[40vh] overflow-y-auto space-y-2">
                  {filteredSchools.map(school => (
                    <Button
                      key={school.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 text-left flex items-center"
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      <School className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-gray-500 truncate">{school.id}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  {searchQuery ? t("no-schools-found") : t("no-schools-available")}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create">
            <div className="space-y-4">
              {/* School selection for new class */}
              <div className="space-y-2">
                <Label htmlFor="school">{t("select-school")}</Label>
                <div className="max-h-[20vh] overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="py-3 flex justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : schools.length > 0 ? (
                    schools.map(school => (
                      <Button
                        key={school.id}
                        variant={newClass.schoolId === school.id ? "default" : "outline"}
                        className="w-full justify-start text-left flex items-center"
                        onClick={() => setNewClass({...newClass, schoolId: school.id})}
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
                disabled={!newClass.name || !newClass.schoolId || creatingClass}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
