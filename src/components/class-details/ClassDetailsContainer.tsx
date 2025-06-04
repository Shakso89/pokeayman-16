
import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ClassDetails from "./ClassDetails";

const ClassDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Add debugging to see what's happening
  console.log("ClassDetailsContainer - Route params:", useParams());
  console.log("ClassDetailsContainer - Route ID:", id);
  console.log("ClassDetailsContainer - Current URL:", window.location.pathname);

  // Check if we have an ID in a different format
  const pathSegments = window.location.pathname.split('/');
  const classId = id || pathSegments[pathSegments.length - 1];
  
  console.log("ClassDetailsContainer - Extracted Class ID:", classId);

  if (!classId || classId === 'class-details') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return <ClassDetails classId={classId} />;
};

export default ClassDetailsContainer;
