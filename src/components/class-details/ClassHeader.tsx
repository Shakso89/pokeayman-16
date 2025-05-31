
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClassHeaderProps {
  classData: any;
  studentsCount: number;
  isClassCreator: boolean;
  isAdmin: boolean;
  onAddStudent: () => void;
  onDeleteClass: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({
  classData,
  studentsCount,
  isClassCreator,
  isAdmin,
  onAddStudent,
  onDeleteClass,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b px-6 py-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher-dashboard")}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="text-gray-500 text-sm">{studentsCount} students</p>
          </div>
        </div>
        
        {isClassCreator && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={onAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Student
            </Button>
            
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={onDeleteClass}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Class
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassHeader;
