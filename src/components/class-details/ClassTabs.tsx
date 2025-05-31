
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookText } from "lucide-react";
import StudentsTable from "./StudentsTable";
import HomeworkManagement from "@/components/teacher/HomeworkManagement";

interface ClassTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  students: any[];
  isClassCreator: boolean;
  classData: any;
  teacherId: string;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onAddStudent: () => void;
}

const ClassTabs: React.FC<ClassTabsProps> = ({
  activeTab,
  onTabChange,
  students,
  isClassCreator,
  classData,
  teacherId,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onAddStudent,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm">
        <TabsTrigger 
          value="students" 
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
        >
          Students
        </TabsTrigger>
        <TabsTrigger 
          value="homework"
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
        >
          Homework
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="students" className="mt-6">
        <StudentsTable
          students={students}
          isClassCreator={isClassCreator}
          onAwardCoins={onAwardCoins}
          onManagePokemon={onManagePokemon}
          onRemoveStudent={onRemoveStudent}
          onAddStudent={onAddStudent}
          classData={classData}
        />
      </TabsContent>

      <TabsContent value="homework" className="mt-6">
        {isClassCreator ? (
          <HomeworkManagement 
            onBack={() => onTabChange("students")}
            teacherId={teacherId}
          />
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-16 text-center">
              <BookText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Only</h3>
              <p className="text-gray-500">You don't have permission to manage homework for this class</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ClassTabs;
