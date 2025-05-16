
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, User, Users, School } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { saveClass, ClassData } from "@/utils/pokemon/classManagement";
import { supabase } from "@/integrations/supabase/client";

interface ClassManagementProps {
  onBack: () => void;
  schoolId: string;
  teacherId: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ 
  onBack, 
  schoolId, 
  teacherId 
}) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({
    name: "",
    description: ""
  });
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Load classes on component mount
  useEffect(() => {
    fetchClasses();
    
    // Subscribe to class changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          fetchClasses();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, teacherId]);
  
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .eq('teacher_id', teacherId);
        
      if (error) {
        throw error;
      }
      
      // Map database class format to ClassData
      const formattedClasses = data.map(dbClass => ({
        id: dbClass.id || '',
        name: dbClass.name || '',
        schoolId: dbClass.school_id || '',
        teacherId: dbClass.teacher_id || null,
        students: dbClass.students || [],
        isPublic: dbClass.is_public !== false,
        description: dbClass.description || '',
        likes: dbClass.likes || [],
        createdAt: dbClass.created_at
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const filteredClasses = allClasses.filter((cls: any) => 
        cls.schoolId === schoolId && cls.teacherId === teacherId
      );
      setClasses(filteredClasses);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateClass = async () => {
    try {
      if (!newClass.name.trim()) {
        toast({
          title: "Error",
          description: "Class name is required",
          variant: "destructive"
        });
        return;
      }
      
      const classData: Omit<ClassData, "id"> = {
        name: newClass.name,
        description: newClass.description,
        schoolId,
        teacherId,
        students: [],
        isPublic: true,
        likes: []
      };
      
      const createdClass = await saveClass(classData);
      
      if (createdClass) {
        toast({
          title: "Success",
          description: "Class created successfully"
        });
        
        setNewClass({ name: "", description: "" });
        fetchClasses();
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
    }
  };
  
  const openAddStudentDialog = async (classId: string) => {
    setSelectedClassId(classId);
    
    try {
      // Get current class students
      const currentClass = classes.find(c => c.id === classId);
      const currentStudents = currentClass?.students || [];
      
      // Get all students assigned to this teacher
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId);
        
      if (error) throw error;
      
      // Filter out students already in the class
      const availableStuds = (data || []).filter(student => 
        !currentStudents.includes(student.id)
      );
      
      setAvailableStudents(availableStuds);
      setSelectedStudents([]);
      setIsAddStudentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    }
  };
  
  const handleAddStudents = async () => {
    if (!selectedClassId || selectedStudents.length === 0) return;
    
    try {
      // Get current class
      const currentClass = classes.find(c => c.id === selectedClassId);
      if (!currentClass) throw new Error("Class not found");
      
      // Update students array
      const updatedStudents = [...(currentClass.students || []), ...selectedStudents];
      
      // Update class in Supabase
      const { error } = await supabase
        .from('classes')
        .update({ students: updatedStudents })
        .eq('id', selectedClassId);
        
      if (error) throw error;
      
      // Also update student class_id fields
      for (const studentId of selectedStudents) {
        await supabase
          .from('students')
          .update({ class_id: selectedClassId })
          .eq('id', studentId);
      }
      
      toast({
        title: "Success",
        description: `${selectedStudents.length} students added to class`
      });
      
      setIsAddStudentDialogOpen(false);
      fetchClasses();
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: "Error",
        description: "Failed to add students to class",
        variant: "destructive"
      });
    }
  };
  
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Class Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Class Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Class</CardTitle>
            <CardDescription>Add a new class to {schoolId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input 
                id="className"
                placeholder="Enter class name" 
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classDescription">Description (Optional)</Label>
              <Textarea 
                id="classDescription"
                placeholder="Enter class description" 
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateClass}
              className="w-full"
              disabled={!newClass.name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </CardFooter>
        </Card>
        
        {/* School Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <School className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">School ID:</span>
              <span className="ml-2 text-gray-600">{schoolId}</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium">Teacher ID:</span>
              <span className="ml-2 text-gray-600">{teacherId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Classes List */}
      <h3 className="text-xl font-semibold mt-8">Your Classes</h3>
      
      {loading ? (
        <div className="text-center py-10">Loading classes...</div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-500">You haven't created any classes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
                {cls.description && (
                  <CardDescription>{cls.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>
                    {cls.students?.length || 0} Students
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => openAddStudentDialog(cls.id)}
                >
                  Add Students
                </Button>
                <Button 
                  variant="default"
                  onClick={() => navigate(`/class-details/${cls.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Students to Class</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {availableStudents.length === 0 ? (
              <p className="text-center py-4">No available students to add.</p>
            ) : (
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div 
                    key={student.id}
                    className={`p-3 border rounded-lg flex items-center cursor-pointer ${
                      selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                      {(student.display_name || student.username || '??')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.display_name || student.username}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                    <div 
                      className={`w-5 h-5 border rounded-sm ${
                        selectedStudents.includes(student.id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedStudents.includes(student.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={selectedStudents.length === 0}
              onClick={handleAddStudents}
            >
              Add {selectedStudents.length} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManagement;
