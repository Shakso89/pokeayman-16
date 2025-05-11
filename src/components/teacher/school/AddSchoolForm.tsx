
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddSchoolFormProps {
  schoolName: string;
  onSchoolNameChange: (value: string) => void;
  onAddSchool: () => void;
}

const AddSchoolForm: React.FC<AddSchoolFormProps> = ({
  schoolName,
  onSchoolNameChange,
  onAddSchool,
}) => {
  return (
    <Card className="pokemon-card">
      <CardHeader>
        <CardTitle>add-new-school</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="school-name"
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
          />
          <Button onClick={onAddSchool}>
            <Plus className="h-4 w-4 mr-1" />
            add-school
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddSchoolForm;
