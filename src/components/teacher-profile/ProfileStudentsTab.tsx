
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProfileStudentsTabProps {
  studentCount: number;
}

export const ProfileStudentsTab: React.FC<ProfileStudentsTabProps> = ({
  studentCount
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <p className="text-sm text-gray-500">
          Total students across all classes: {studentCount}
        </p>
      </CardHeader>
      <CardContent>
        {studentCount > 0 ? (
          <p>Students list would appear here in a real implementation</p>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No students yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
