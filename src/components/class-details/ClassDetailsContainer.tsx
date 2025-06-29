
import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ClassDetails } from "./ClassDetails";

const ClassDetailsContainer: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  
  console.log("ClassDetailsContainer - Route params:", { classId });
  console.log("ClassDetailsContainer - Current URL:", window.location.pathname);

  if (!classId) {
    console.error("ClassDetailsContainer - No class ID found in URL parameters");
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Class not found</p>
          <p className="text-sm text-gray-500">
            No class ID found in URL. Please check the URL.
          </p>
        </div>
      </div>
    );
  }

  console.log("ClassDetailsContainer - Rendering ClassDetails with ID:", classId);
  return <ClassDetails classId={classId} />;
};

export default ClassDetailsContainer;
