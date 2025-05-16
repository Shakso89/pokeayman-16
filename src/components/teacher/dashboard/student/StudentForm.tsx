
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface School {
  id: string;
  name: string;
}

interface StudentFormProps {
  studentData: {
    username: string;
    password: string;
    displayName: string;
    schoolId?: string;
  };
  setStudentData: React.Dispatch<React.SetStateAction<{
    username: string;
    password: string;
    displayName: string;
    schoolId?: string;
  }>>;
  isLoading: boolean;
  teacherId: string | null;
}

const StudentForm: React.FC<StudentFormProps> = ({
  studentData,
  setStudentData,
  isLoading,
  teacherId
}) => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  // Fetch available schools for this teacher
  useEffect(() => {
    const fetchSchools = async () => {
      if (!teacherId) return;
      
      setIsLoadingSchools(true);
      try {
        // Attempt to fetch from Supabase first
        const { data, error } = await supabase
          .from('schools')
          .select('id, name');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSchools(data);
        } else {
          // Fallback to localStorage if no schools found in DB
          const savedSchools = localStorage.getItem("schools");
          if (savedSchools) {
            const parsedSchools = JSON.parse(savedSchools);
            setSchools(parsedSchools.map((school: any) => ({
              id: school.id,
              name: school.name
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        
        // Fallback to localStorage on error
        const savedSchools = localStorage.getItem("schools");
        if (savedSchools) {
          const parsedSchools = JSON.parse(savedSchools);
          setSchools(parsedSchools.map((school: any) => ({
            id: school.id,
            name: school.name
          })));
        }
      } finally {
        setIsLoadingSchools(false);
      }
    };
    
    fetchSchools();
  }, [teacherId]);

  return (
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
      
      <div className="space-y-2">
        <Label htmlFor="studentSchool">{t("school")}</Label>
        <Select 
          disabled={isLoading || isLoadingSchools} 
          value={studentData.schoolId}
          onValueChange={(value) => setStudentData({...studentData, schoolId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingSchools ? "Loading schools..." : "Select a school"} />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
            {schools.length === 0 && !isLoadingSchools && (
              <SelectItem value="none" disabled>
                No schools available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentForm;
