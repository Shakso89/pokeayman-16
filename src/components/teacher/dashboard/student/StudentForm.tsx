
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { validateStudentData } from "./studentUtils";

interface School {
  id: string;
  name: string;
}

interface ValidationErrors {
  username?: string;
  password?: string;
  displayName?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch available schools for this teacher
  useEffect(() => {
    const fetchSchools = async () => {
      if (!teacherId) return;
      
      setIsLoadingSchools(true);
      try {
        console.log("Fetching schools for teacher:", teacherId);
        
        // Attempt to fetch from Supabase first
        const { data, error } = await supabase
          .from('schools')
          .select('id, name');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSchools(data);
          console.log("Found schools in database:", data.length);
        } else {
          // Fallback to localStorage if no schools found in DB
          const savedSchools = localStorage.getItem("schools");
          if (savedSchools) {
            const parsedSchools = JSON.parse(savedSchools);
            setSchools(parsedSchools.map((school: any) => ({
              id: school.id,
              name: school.name
            })));
            console.log("Found schools in localStorage:", parsedSchools.length);
          } else {
            console.log("No schools found");
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

  // Validate form field when value changes
  const validateField = (name: string, value: string) => {
    const { errors } = validateStudentData({
      ...studentData,
      [name]: value
    });
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: errors[name]
    }));
    
    return !errors[name];
  };

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    validateField(field, studentData[field as keyof typeof studentData] as string);
  };

  // Update student data with validation
  const updateStudentData = (field: keyof typeof studentData, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="studentUsername" className="flex items-center">
          {t("username")}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="studentUsername"
          value={studentData.username}
          onChange={(e) => updateStudentData('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          placeholder={t("student-username")}
          disabled={isLoading}
          className={validationErrors.username && touched.username ? "border-red-500" : ""}
        />
        {validationErrors.username && touched.username && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.username}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="studentDisplayName" className="flex items-center">
          {t("display-name")}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="studentDisplayName"
          value={studentData.displayName}
          onChange={(e) => updateStudentData('displayName', e.target.value)}
          onBlur={() => handleBlur('displayName')}
          placeholder={t("student-display-name")}
          disabled={isLoading}
          className={validationErrors.displayName && touched.displayName ? "border-red-500" : ""}
        />
        {validationErrors.displayName && touched.displayName && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.displayName}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="studentPassword" className="flex items-center">
          {t("password")}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="studentPassword"
          type="password"
          value={studentData.password}
          onChange={(e) => updateStudentData('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder={t("create-password")}
          disabled={isLoading}
          className={validationErrors.password && touched.password ? "border-red-500" : ""}
        />
        {validationErrors.password && touched.password && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
        )}
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

      {Object.values(validationErrors).some(error => !!error) && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors before submitting
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StudentForm;
