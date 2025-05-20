
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

  useEffect(() => {
    if (open) {
      fetchSchools();
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
    
    // Navigate to the class creation page for the selected school
    navigate(`/create-class/${selectedSchoolId}`);
    onOpenChange(false);
  };

  // Filter schools based on search query
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("select-school")}</DialogTitle>
          <DialogDescription>
            {t("select-school-to-create-class")}
          </DialogDescription>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
};
