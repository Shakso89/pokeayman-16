
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import SchoolCollaboration from "./SchoolCollaboration";

interface CollaborationViewProps {
  onBack: () => void;
  teacherId: string;
  teacherName: string;
}

const CollaborationView: React.FC<CollaborationViewProps> = ({ 
  onBack, 
  teacherId, 
  teacherName 
}) => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">School Collaboration</h2>
      </div>
      
      <SchoolCollaboration 
        teacherId={teacherId} 
        teacherName={teacherName} 
      />
    </div>
  );
};

export default CollaborationView;
