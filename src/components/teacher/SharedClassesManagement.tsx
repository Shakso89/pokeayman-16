
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Share, Users, Plus, Check, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/utils/notificationService";

interface Class {
  id: string;
  name: string;
  school_id: string;
  teacher_id: string;
  description?: string;
}

interface School {
  id: string;
  name: string;
}

interface ShareRequest {
  id: string;
  class_id: string;
  class_name: string;
  school_name: string;
  from_teacher_id: string;
  from_teacher_name: string;
  to_teacher_id: string;
  to_teacher_name: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface SharedClassesManagementProps {
  teacherId: string;
  teacherName: string;
}

const SharedClassesManagement: React.FC<SharedClassesManagementProps> = ({
  teacherId,
  teacherName
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [shareRequests, setShareRequests] = useState<ShareRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [targetTeacherName, setTargetTeacherName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load teacher's classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          schools (
            id,
            name
          )
        `)
        .eq('teacher_id', teacherId);

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // Load schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');

      if (schoolsError) throw schoolsError;
      setSchools(schoolsData || []);

      // Load share requests (both sent and received)
      // Note: This would require a proper table structure for sharing requests
      // For now, using localStorage as a temporary solution
      const savedRequests = JSON.parse(localStorage.getItem("classShareRequests") || "[]");
      setShareRequests(savedRequests);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load classes data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendShareRequest = async () => {
    if (!selectedClass || !targetTeacherName.trim()) {
      toast({
        title: "Error",
        description: "Please select a class and enter teacher name",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find target teacher
      const { data: targetTeacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', targetTeacherName.trim())
        .single();

      if (teacherError || !targetTeacher) {
        toast({
          title: "Error",
          description: "Teacher not found",
          variant: "destructive"
        });
        return;
      }

      // Get school name
      const school = schools.find(s => s.id === selectedClass.school_id);
      const schoolName = school?.name || "Unknown School";

      // Create share request
      const newRequest: ShareRequest = {
        id: `req-${Date.now()}`,
        class_id: selectedClass.id,
        class_name: selectedClass.name,
        school_name: schoolName,
        from_teacher_id: teacherId,
        from_teacher_name: teacherName,
        to_teacher_id: targetTeacher.id,
        to_teacher_name: targetTeacher.display_name || targetTeacher.username,
        status: "pending",
        created_at: new Date().toISOString()
      };

      // Save to localStorage (temporary solution)
      const updatedRequests = [...shareRequests, newRequest];
      setShareRequests(updatedRequests);
      localStorage.setItem("classShareRequests", JSON.stringify(updatedRequests));

      // Send notification to target teacher
      await createNotification(
        targetTeacher.id,
        'Class Sharing Request',
        `${teacherName} wants to share class "${selectedClass.name}" from ${schoolName} with you`,
        'class_share_request'
      );

      toast({
        title: "Success",
        description: `Share request sent to ${targetTeacher.display_name || targetTeacher.username}`,
      });

      setIsDialogOpen(false);
      setTargetTeacherName("");
      setSelectedClass(null);

    } catch (error: any) {
      console.error('Error sending share request:', error);
      toast({
        title: "Error",
        description: "Failed to send share request",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (request: ShareRequest) => {
    // Update request status
    const updatedRequests = shareRequests.map(req => 
      req.id === request.id ? { ...req, status: "accepted" as const } : req
    );
    setShareRequests(updatedRequests);
    localStorage.setItem("classShareRequests", JSON.stringify(updatedRequests));

    // Send notification to requester
    await createNotification(
      request.from_teacher_id,
      'Class Share Request Accepted',
      `${teacherName} accepted your request to share class "${request.class_name}"`,
      'class_share_accepted'
    );

    toast({
      title: "Success",
      description: `You now have access to class "${request.class_name}"`,
    });
  };

  const handleRejectRequest = async (request: ShareRequest) => {
    // Update request status
    const updatedRequests = shareRequests.map(req => 
      req.id === request.id ? { ...req, status: "rejected" as const } : req
    );
    setShareRequests(updatedRequests);
    localStorage.setItem("classShareRequests", JSON.stringify(updatedRequests));

    // Send notification to requester
    await createNotification(
      request.from_teacher_id,
      'Class Share Request Declined',
      `${teacherName} declined your request to share class "${request.class_name}"`,
      'class_share_rejected'
    );

    toast({
      title: "Request Rejected",
      description: `You declined the request for "${request.class_name}"`,
    });
  };

  const incomingRequests = shareRequests.filter(
    req => req.to_teacher_id === teacherId && req.status === "pending"
  );
  
  const outgoingRequests = shareRequests.filter(
    req => req.from_teacher_id === teacherId
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Loading shared classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5 text-indigo-500" />
            Shared Classes Management
          </CardTitle>
          <CardDescription>
            Share your classes with other teachers and manage collaboration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Classes</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Class with Teacher</DialogTitle>
                    <DialogDescription>
                      Enter the teacher's username to send a class sharing request
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Class</Label>
                      <select 
                        className="w-full border rounded p-2 mt-1"
                        onChange={(e) => {
                          const classData = classes.find(c => c.id === e.target.value);
                          setSelectedClass(classData || null);
                        }}
                        value={selectedClass?.id || ""}
                      >
                        <option value="">Choose a class...</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label>Teacher Username</Label>
                      <Input
                        value={targetTeacherName}
                        onChange={(e) => setTargetTeacherName(e.target.value)}
                        placeholder="Enter teacher username"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendShareRequest}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => {
                  const school = schools.find(s => s.id === cls.school_id);
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{school?.name || "Unknown"}</TableCell>
                      <TableCell>{cls.description || "No description"}</TableCell>
                      <TableCell>
                        <Badge>Owner</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Incoming Share Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From Teacher</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.from_teacher_name}</TableCell>
                    <TableCell>{request.class_name}</TableCell>
                    <TableCell>{request.school_name}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request)}
                          className="text-red-500 border-red-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Share Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To Teacher</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outgoingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.to_teacher_name}</TableCell>
                    <TableCell>{request.class_name}</TableCell>
                    <TableCell>{request.school_name}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          request.status === "accepted" ? "bg-green-500" : 
                          request.status === "rejected" ? "bg-red-500" : 
                          "bg-yellow-500"
                        }
                      >
                        {request.status === "pending" ? "Pending" : 
                         request.status === "accepted" ? "Accepted" :
                         "Declined"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharedClassesManagement;
