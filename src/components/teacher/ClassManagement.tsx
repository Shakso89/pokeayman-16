
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, User, Users, School, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { saveClass, deleteClass } from "@/utils/pokemon/index";
import { ClassData } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({
    name: "",
    description: ""
  });
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if current user is Admin
  useEffect(() => {
    const username = localStorage.getItem("teacherUsername") || "";
    setIsAdmin(username === "Admin" || username === "Ayman");
  }, []);
  
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
          title: t("error"),
          description: t("class-name-required"),
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
        likes: [],
        createdAt: new Date().toISOString() // Add createdAt property with current date
      };
      
      const createdClass = await saveClass(classData);
      
      if (createdClass) {
        toast({
          title: t("success"),
          description: t("class-created-successfully")
        });
        
        setNewClass({ name: "", description: "" });
        fetchClasses();
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-create-class"),
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    try {
      const success = await deleteClass(classId);
      
      if (success) {
        toast({
          title: t("success"),
          description: t("class-deleted-successfully")
        });
        
        setIsDeleteDialogOpen(false);
        fetchClasses();
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-delete-class"),
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
      
      // Try to get students from localStorage
      try {
        const savedStudents = localStorage.getItem("students");
        const currentClass = classes.find(c => c.id === classId);
        const currentStudents = currentClass?.students || [];
        
        if (savedStudents) {
          const allStudents = JSON.parse(savedStudents);
          const teacherStudents = allStudents.filter((student: any) => 
            student.teacherId === teacherId
          );
          const availableStudents = teacherStudents.filter((student: any) => 
            !currentStudents.includes(student.id)
          );
          
          setAvailableStudents(availableStudents);
          setSelectedStudents([]);
          setIsAddStudentDialogOpen(true);
        } else {
          toast({
            title: t("error"),
            description: t("failed-to-load-students"),
            variant: "destructive"
          });
        }
      } catch (localError) {
        console.error("Error accessing localStorage:", localError);
        toast({
          title: t("error"),
          description: t("failed-to-load-students"),
          variant: "destructive"
        });
      }
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
        
      if (error) {
        console.error("Error updating class in Supabase:", error);
        // Fallback to localStorage
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = allClasses.map((cls: any) => {
          if (cls.id === selectedClassId) {
            return {
              ...cls,
              students: updatedStudents
            };
          }
          return cls;
        });
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        
        // Also update in-memory classes
        setClasses(classes.map(cls => 
          cls.id === selectedClassId ? { ...cls, students: updatedStudents } : cls
        ));
      }
      
      // Also update student class_id fields
      for (const studentId of selectedStudents) {
        try {
          await supabase
            .from('students')
            .update({ class_id: selectedClassId })
            .eq('id', studentId);
        } catch (error) {
          console.error(`Error updating student ${studentId} class_id:`, error);
          // Fallback to localStorage for this student
          const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
          const updatedStudents = allStudents.map((student: any) => {
            if (student.id === studentId) {
              return {
                ...student,
                classId: selectedClassId
              };
            }
            return student;
          });
          localStorage.setItem("students", JSON.stringify(updatedStudents));
        }
      }
      
      toast({
        title: t("success"),
        description: `${selectedStudents.length} ${t("students-added-to-class")}`
      });
      
      setIsAddStudentDialogOpen(false);
      fetchClasses();
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
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
          {t("back")}
        </Button>
        <h2 className="text-2xl font-bold">{t("class-management")}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Class Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("create-new-class")}</CardTitle>
            <CardDescription>{t("add-new-class-to")} {schoolId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">{t("class-name")}</Label>
              <Input 
                id="className"
                placeholder={t("enter-class-name")} 
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classDescription">{t("description")} ({t("optional")})</Label>
              <Textarea 
                id="classDescription"
                placeholder={t("enter-class-description")} 
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
              {t("create-class")}
            </Button>
          </CardFooter>
        </Card>
        
        {/* School Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("school-information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <School className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">{t("school-id")}:</span>
              <span className="ml-2 text-gray-600">{schoolId}</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium">{t("teacher-id")}:</span>
              <span className="ml-2 text-gray-600">{teacherId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Classes List */}
      <h3 className="text-xl font-semibold mt-8">{t("your-classes")}</h3>
      
      {loading ? (
        <div className="text-center py-10">{t("loading-classes")}...</div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-500">{t("no-classes-yet")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{cls.name}</span>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClassToDelete(cls.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                {cls.description && (
                  <CardDescription>{cls.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>
                    {cls.students?.length || 0} {t("students")}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => openAddStudentDialog(cls.id)}
                >
                  {t("add-students")}
                </Button>
                <Button 
                  variant="default"
                  onClick={() => navigate(`/class-details/${cls.id}`)}
                >
                  {t("view-details")}
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
            <DialogTitle>{t("add-students-to-class")}</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {availableStudents.length === 0 ? (
              <p className="text-center py-4">{t("no-available-students")}</p>
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
              {t("cancel")}
            </Button>
            <Button 
              disabled={selectedStudents.length === 0}
              onClick={handleAddStudents}
            >
              {t("add")} {selectedStudents.length} {t("students")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete-class")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete-class-confirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => classToDelete && handleDeleteClass(classToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassManagement;
