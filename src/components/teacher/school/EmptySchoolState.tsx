
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School as SchoolIcon, Plus } from "lucide-react";

interface EmptySchoolStateProps {
  isAdmin: boolean;
  onAddSchool: () => void;
}

const EmptySchoolState: React.FC<EmptySchoolStateProps> = ({ isAdmin, onAddSchool }) => {
  return (
    <Card className="col-span-full border-dashed">
      <CardContent className="p-8 text-center">
        <SchoolIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">no-schools-yet</h3>
        <p className="text-gray-500 mb-6">
          {isAdmin 
            ? "create-first-school-description"
            : "no-schools-assigned"}
        </p>
        {isAdmin && (
          <Button onClick={onAddSchool}>
            <Plus className="h-4 w-4 mr-1" />
            create-first-school
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptySchoolState;
