
import React from "react";
import { School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SchoolInfoProps {
  schoolName?: string;
  schoolId?: string;
  className?: string;
}

const SchoolInfo: React.FC<SchoolInfoProps> = ({ 
  schoolName, 
  schoolId, 
  className = "" 
}) => {
  if (!schoolName && !schoolId) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <School className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">School</p>
            <p className="font-medium text-gray-900">
              {schoolName || "No School Assigned"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolInfo;
