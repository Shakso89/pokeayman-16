
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Coins, PlusCircle, UserMinus } from "lucide-react";
import { motion } from "framer-motion";

interface StudentsTableProps {
  students: any[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onAddStudent: () => void;
  classData: any;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onAddStudent,
  classData,
}) => {
  if (students.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Class Students (0)
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <PlusCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
            <p className="text-gray-500 mb-6">Add students to get started with your class</p>
            {isClassCreator && (
              <Button 
                onClick={onAddStudent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Students
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Class Students ({students.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Student</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Coins</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <motion.tr 
                  key={student.id} 
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(student.display_name || student.displayName || student.username)
                              .substring(0, 1)
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.display_name || student.displayName || student.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{student.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{student.coins}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {isClassCreator && (
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          onClick={() => onAwardCoins(
                            student.id,
                            student.display_name || student.displayName || student.username
                          )}
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          Award Coins
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          onClick={() => onManagePokemon(
                            student.id,
                            student.display_name || student.displayName || student.username,
                            classData.school_id || classData.schoolId
                          )}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Manage Pokémon
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => onRemoveStudent(
                            student.id,
                            student.display_name || student.displayName || student.username
                          )}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
