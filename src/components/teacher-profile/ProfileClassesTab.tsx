
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface Class {
  id: string;
  name: string;
}

interface ProfileClassesTabProps {
  classes: Class[];
}

export const ProfileClassesTab: React.FC<ProfileClassesTabProps> = ({ classes }) => {
  const navigate = useNavigate();

  const handleClassClick = (classId: string) => {
    navigate(`/class-details/${classId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classes</CardTitle>
        <p className="text-sm text-gray-500">
          Total classes: {classes.length}
        </p>
      </CardHeader>
      <CardContent>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => handleClassClick(c.id)}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{c.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No classes taught by this teacher.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
