
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addCreditsToTeacher, getAllTeacherCredits } from "@/utils/creditService";
import { TeacherCredit } from "@/types/teacher";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from "./TransactionHistory";

const CreditManagement: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [creditAmount, setCreditAmount] = useState(50);
  const [reason, setReason] = useState("");
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
  
  const handleAddCredits = async () => {
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
        
        // Reset form
        setCreditAmount(50);
        setReason("");
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
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2" 
                    onClick={loadTeacherCredits}
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <p className="text-center text-gray-500 p-4">
                    {t("loading") || "Loading..."}
                  </p>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.teacherId}
                      className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                        selectedTeacher?.teacherId === teacher.teacherId
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      onClick={() => handleSelectTeacher(teacher)}
                    >
                      <div>
                        <p className="font-medium">{teacher.username}</p>
                        <p className="text-xs text-gray-500">{teacher.teacherId}</p>
                      </div>
                      <Badge className="bg-green-600">
                        {teacher.credits} Credits
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 p-4">
                    {t("no-teachers-found") || "No teachers found"}
                  </p>
                )}
              </div>
              
              {selectedTeacher && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle>{selectedTeacher.username}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {t("available-credits") || "Available Credits"}: {selectedTeacher.credits}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("used-credits") || "Used Credits"}: {selectedTeacher.usedCredits}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">{t("credit-amount") || "Credit Amount"}</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={creditAmount}
                          min="1"
                          onChange={(e) => setCreditAmount(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">{t("reason") || "Reason"}</Label>
                        <Input
                          id="reason"
                          value={reason}
                          placeholder="e.g., Monthly subscription"
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddCredits} className="w-full">
                        {t("add-credits") || "Add Credits"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("credit-pricing") || "Credit Pricing"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>• Create a student account: 5 credits</p>
                <p>• Assign homework: 5 credits</p>
                <p>• Approve homework: Credits equal to coin reward</p>
                <p>• Award coins manually: 1 credit per coin</p>
                <p>• Delete a Pokémon: 2 credits</p>
              </div>
            </CardContent>
          </Card>
          
          {selectedTeacher && (
            <TransactionHistory teacher={selectedTeacher} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditManagement;
