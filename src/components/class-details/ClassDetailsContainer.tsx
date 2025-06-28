
import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ClassDetails } from "./ClassDetails";

const ClassDetailsContainer: React.FC = () => {
  const { classId, id } = useParams<{ classId?: string; id?: string }>();

  // Handle both possible parameter names for backward compatibility
  const actualClassId = classId || id;
  
  console.log("ClassDetailsContainer - Route params:", { classId, id, actualClassId });
  console.log("ClassDetailsContainer - Current URL:", window.location.pathname);
  console.log("ClassDetailsContainer - Full URL:", window.location.href);

  if (!actualClassId) {
    console.error("ClassDetailsContainer - No class ID found in URL parameters");
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading class details...</p>
          <p className="text-sm text-gray-500 mt-2">
            No class ID found. Please check the URL.
          </p>
        </div>
      </div>
    );
  }

  console.log("ClassDetailsContainer - Rendering ClassDetails with ID:", actualClassId);
  return <ClassDetails classId={actualClassId} />;
};

export default ClassDetailsContainer;
