
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School } from "@/types/pokemon";
import { Edit, Trash2, School as SchoolIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SchoolCardProps {
  school: School;
  isAdmin: boolean;
  editingSchoolId: string | null;
  onEditSchool: (schoolId: string) => void;
  onUpdateSchool: (schoolId: string, newName: string) => void;
  onDeleteSchool: (schoolId: string) => void;
  onSelectSchool: (schoolId: string) => void;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  isAdmin,
  editingSchoolId,
  onEditSchool,
  onUpdateSchool,
  onDeleteSchool,
  onSelectSchool,
}) => {
  return (
    <Card key={school.id} className="pokemon-card hover:shadow-md transition-shadow">
      {editingSchoolId === school.id ? (
        <CardContent className="pt-6">
          <Input
            defaultValue={school.name}
            autoFocus
            onBlur={(e) => onUpdateSchool(school.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdateSchool(school.id, e.currentTarget.value);
              } else if (e.key === "Escape") {
                onEditSchool("");
              }
            }}
          />
        </CardContent>
      ) : (
        <>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="flex items-center gap-2">
                <SchoolIcon className="h-5 w-5 text-blue-500" />
                {school.name}
              </CardTitle>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSchool(school.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSchool(school.id)}
                    className="text-red-500 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {school.name === "New School" && (
              <Alert className="mb-3 bg-amber-50">
                <AlertDescription>
                  contact-admin-after-creating-classes
                </AlertDescription>
              </Alert>
            )}
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => onSelectSchool(school.id)}
            >
              manage-classes
            </Button>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default SchoolCard;
