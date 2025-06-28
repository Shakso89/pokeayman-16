
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Coins, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StudentProfile } from '@/services/studentDatabase';

interface StudentListTabProps {
  students: StudentProfile[];
  classId: string;
  onGiveCoins?: (studentId: string) => void;
  onRemoveCoins?: (studentId: string) => void;
}

export const StudentListTab: React.FC<StudentListTabProps> = ({ 
  students, 
  classId, 
  onGiveCoins, 
  onRemoveCoins 
}) => {
  const navigate = useNavigate();

  const handleViewStudent = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students in this class yet.
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback>
                        {(student.display_name || student.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">{student.display_name || student.username}</h3>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {student.coins || 0}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      {onGiveCoins && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onGiveCoins(student.user_id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onRemoveCoins && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveCoins(student.user_id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student.user_id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
