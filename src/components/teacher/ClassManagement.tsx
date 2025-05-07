
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, UserPlus, Trash2, School } from "lucide-react";

interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
}

interface Class {
  id: string;
  name: string;
  school: string;
  students: Student[];
}

interface ClassManagementProps {
  onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<Class[]>(() => {
    const savedClasses = localStorage.getItem("classes");
    return savedClasses ? JSON.parse(savedClasses) : [];
  });
  
  const [currentView, setCurrentView] = useState<"list" | "add" | "students">("list");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [newClass, setNewClass] = useState({
    name: "",
    school: ""
  });
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: ""
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Save classes to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("classes", JSON.stringify(classes));
  }, [classes]);

  const handleAddClass = () => {
    if (!newClass.name || !newClass.school) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newClassObject: Class = {
      id: Date.now().toString(),
      name: newClass.name,
      school: newClass.school,
      students: []
    };

    setClasses([...classes, newClassObject]);
    setNewClass({ name: "", school: "" });
    setCurrentView("list");
    
    toast({
      title: "Success",
      description: `Class "${newClass.name}" has been created!`
    });
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.username || !newStudent.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: [
            ...cls.students,
            {
              id: Date.now().toString(),
              name: newStudent.name,
              username: newStudent.username,
              password: newStudent.password
            }
          ]
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setNewStudent({ name: "", username: "", password: "" });
    
    toast({
      title: "Success",
      description: `Student "${newStudent.name}" has been added!`
    });
  };
  
  const handleDeleteClass = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
    toast({
      title: "Success",
      description: "Class has been deleted!"
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          students: cls.students.filter(student => student.id !== studentId)
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    toast({
      title: "Success",
      description: "Student has been removed!"
    });
  };

  // Main class listing view
  if (currentView === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold">Manage Classes</h2>
          </div>
          <Button onClick={() => setCurrentView("add")}>
            <Plus className="h-4 w-4 mr-1" />
            Add New Class
          </Button>
        </div>

        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <School className="h-5 w-5 text-blue-500" />
                      {cls.name}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-500 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-gray-500">{cls.school}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{cls.students.length} student{cls.students.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setCurrentView("students");
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Manage Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-8">
            <div className="text-center">
              <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Classes Yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first class.</p>
              <Button onClick={() => setCurrentView("add")}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Class
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }
  
  // Add new class form
  if (currentView === "add") {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => setCurrentView("list")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Classes
          </Button>
          <h2 className="text-2xl font-bold ml-4">Add New Class</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input 
                  id="className" 
                  placeholder="Enter class name" 
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input 
                  id="schoolName" 
                  placeholder="Enter school name" 
                  value={newClass.school}
                  onChange={(e) => setNewClass({...newClass, school: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentView("list")}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddClass}>Create Class</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Manage students for a class
  if (currentView === "students" && selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => setCurrentView("list")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Classes
          </Button>
          <h2 className="text-2xl font-bold ml-4">
            Students in {selectedClass.name}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Full Name</Label>
                  <Input 
                    id="studentName" 
                    placeholder="Enter student's full name" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentUsername">Username</Label>
                  <Input 
                    id="studentUsername" 
                    placeholder="Create a username for the student" 
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentPassword">Password</Label>
                  <Input 
                    id="studentPassword" 
                    placeholder="Create a password" 
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  />
                </div>
                
                <Button type="button" onClick={handleAddStudent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Student
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Student List</h3>
            {selectedClass.students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedClass.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.password}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-gray-500">No students added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ClassManagement;
