
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { validateStudentData } from "./studentUtils";

interface ValidationErrors {
  username?: string;
  password?: string;
  displayName?: string;
  schoolId?: string;
}

interface School {
  id: string;
  name: string;
}

interface StudentFormProps {
  studentData: {
    username: string;
    password: string;
    displayName: string;
    schoolId: string;
  };
  setStudentData: React.Dispatch<React.SetStateAction<{
    username: string;
    password: string;
    displayName: string;
    schoolId: string;
  }>>;
  isLoading: boolean;
  teacherId: string | null;
  schools: School[];
  isLoadingSchools: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  studentData,
  setStudentData,
  isLoading,
  teacherId,
  schools,
  isLoadingSchools
}) => {
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
        <Label htmlFor="schoolSelect" className="flex items-center">
          {t("school") || "School"}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={studentData.schoolId}
          onValueChange={(value) => updateStudentData('schoolId', value)}
          disabled={isLoading || isLoadingSchools}
        >
          <SelectTrigger className={validationErrors.schoolId && touched.schoolId ? "border-red-500" : ""}>
            <SelectValue placeholder={
              isLoadingSchools 
                ? "Loading schools..." 
                : (t("select-school") || "Select a school")
            } />
          </SelectTrigger>
          <SelectContent>
            {isLoadingSchools ? (
              <SelectItem value="loading" disabled>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading schools...
                </div>
              </SelectItem>
            ) : schools.length === 0 ? (
              <SelectItem value="no-schools" disabled>
                No schools available
              </SelectItem>
            ) : (
              schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {validationErrors.schoolId && touched.schoolId && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.schoolId}</p>
        )}
        {!studentData.schoolId && (
          <p className="text-sm text-gray-500 mt-1">
            Students will be assigned to the selected school
          </p>
        )}
      </div>

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
