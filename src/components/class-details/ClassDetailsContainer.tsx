
import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ClassDetails from "./ClassDetails";

const ClassDetailsContainer: React.FC = () => {
  const { classId, id } = useParams<{ classId?: string; id?: string }>();

  // Handle both possible parameter names for backward compatibility
  const actualClassId = classId || id;
  
  console.log("ClassDetailsContainer - Route params:", { classId, id, actualClassId });
  console.log("ClassDetailsContainer - Current URL:", window.location.pathname);

  if (!actualClassId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return <ClassDetails classId={actualClassId} />;
};

export default ClassDetailsContainer;
