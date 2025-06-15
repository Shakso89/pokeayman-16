
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { School, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface School {
  id: string;
  name: string;
}

interface ClassInfo {
  id: string;
  name: string;
  description?: string;
}

interface SchoolClassInfoProps {
  school?: School;
  classes: ClassInfo[];
  onClassClick?: (classId: string) => void;
}

const SchoolClassInfo: React.FC<SchoolClassInfoProps> = ({
  school,
  classes,
  onClassClick
}) => {
  const navigate = useNavigate();

  const handleClassClick = (classId: string, className: string) => {
    if (onClassClick) {
      onClassClick(classId);
    } else {
      // Navigate to class view page
      navigate(`/student/class/${classId}`, { state: { className } });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          School & Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* School Information */}
          {school ? (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <School className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">School</span>
              </div>
              <p className="text-blue-700 font-medium">{school.name}</p>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-gray-500" />
                <p className="font-medium text-gray-500">No school assigned</p>
              </div>
            </div>
          )}

          {/* Classes Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-800">
                Classes ({classes.length})
              </span>
            </div>

            {classes.length > 0 ? (
              <div className="space-y-2">
                {classes.map((classInfo) => (
                  <div
                    key={classInfo.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{classInfo.name}</p>
                      {classInfo.description && (
                        <p className="text-sm text-gray-500">{classInfo.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClassClick(classInfo.id, classInfo.name)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Not assigned to any classes yet</p>
                <p className="text-sm text-gray-400">
                  Contact your teacher to be added to a class
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolClassInfo;
