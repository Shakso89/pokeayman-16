
import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ClassDetails from "./ClassDetails";

const ClassDetailsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Add debugging to see what's happening
  console.log("ClassDetailsContainer - Route ID:", id);

  if (!id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return <ClassDetails />;
};

export default ClassDetailsContainer;
