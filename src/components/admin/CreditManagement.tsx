
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addCreditsToTeacher, getAllTeacherCredits } from "@/utils/creditService";
import { TeacherCredit } from "@/types/teacher";
import { useTranslation } from "@/hooks/useTranslation";
import TeacherList from "./credit/TeacherList";
import CreditForm from "./credit/CreditForm";
import PricingCard from "./credit/PricingCard";
import TransactionHistory from "./TransactionHistory";

const CreditManagement: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherCredit | null>(null);
  const [teacherCredits, setTeacherCredits] = useState<TeacherCredit[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load all teacher credits
  useEffect(() => {
    loadTeacherCredits();
  }, []);
  
  const loadTeacherCredits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const credits = await getAllTeacherCredits();
      console.log("Loaded teacher credits:", credits);
      setTeacherCredits(credits);
      setFilteredTeachers(credits);
    } catch (error) {
      console.error("Error loading teacher credits:", error);
      setError("Failed to load teacher credits. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load teacher credits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter teachers based on search term
  useEffect(() => {
    const filtered = teacherCredits.filter(
      (teacher) =>
        teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teacherCredits]);
  
  const handleSelectTeacher = (teacher: TeacherCredit) => {
    setSelectedTeacher(teacher);
    setError(null); // Clear any previous errors
  };
  
  const handleAddCredits = async (creditAmount: number, reason: string) => {
    if (!selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select a teacher",
        variant: "destructive",
      });
      return;
    }
    
    if (creditAmount <= 0) {
      toast({
        title: "Error",
        description: "Credit amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log(`Adding ${creditAmount} credits to teacher ${selectedTeacher.teacherId} with reason: ${reason}`);
      const success = await addCreditsToTeacher(
        selectedTeacher.teacherId,
        creditAmount,
        reason
      );
      
      if (success) {
        toast({
          title: "Success",
          description: `${creditAmount} credits added to ${selectedTeacher.username}`,
        });
        
        // Refresh data
        await loadTeacherCredits();
        
        // Find and update selected teacher
        const updatedTeachers = await getAllTeacherCredits();
        const updatedSelectedTeacher = updatedTeachers.find((tc) => tc.teacherId === selectedTeacher.teacherId) || null;
        setSelectedTeacher(updatedSelectedTeacher);
      } else {
        toast({
          title: "Error",
          description: "Failed to add credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding credits",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("credit-management") || "Credit Management"}</CardTitle>
            <CardDescription>
              {t("credit-management-description") || "Manage teacher credits for the platform"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">{t("search-teachers") || "Search Teachers"}</Label>
                <Input
                  id="search"
                  placeholder="Search by username or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                <TeacherList
                  isLoading={isLoading}
                  error={error}
                  filteredTeachers={filteredTeachers}
                  selectedTeacher={selectedTeacher}
                  onSelectTeacher={handleSelectTeacher}
                  onRetry={loadTeacherCredits}
                />
              </div>
              
              {selectedTeacher && (
                <CreditForm 
                  teacher={selectedTeacher} 
                  onAddCredits={handleAddCredits} 
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <PricingCard />
          
          {selectedTeacher && (
            <TransactionHistory teacher={selectedTeacher} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditManagement;
