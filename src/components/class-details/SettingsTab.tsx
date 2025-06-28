
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Settings } from "lucide-react";
import { ClassData } from '@/types/pokemon';

interface SettingsTabProps {
  classId: string;
  classData: ClassData | null;
  refreshClassDetails: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ classId, classData, refreshClassDetails }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Class Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              value={classData?.name || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="class-description">Description</Label>
            <Textarea
              id="class-description"
              value={classData?.description || ''}
              readOnly
              className="bg-gray-50"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="join-code">Join Code</Label>
            <Input
              id="join-code"
              value={classData?.join_code || ''}
              readOnly
              className="bg-gray-50 font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              Students can use this code to join your class
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete a class, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Class
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
