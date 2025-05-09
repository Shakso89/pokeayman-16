
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { School, Merge, Users } from "lucide-react";

interface Teacher {
  id: string;
  displayName: string;
  username: string;
  schools?: string[];
}

interface Class {
  id: string;
  name: string;
  school: string;
  teacherId: string;
  collaborators?: string[];
  pendingRequests?: string[];
}

interface MergeRequest {
  id: string;
  fromTeacherId: string;
  fromTeacherName: string;
  toTeacherId: string;
  classId: string;
  className: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface SchoolCollaborationProps {
  teacherId: string;
  teacherName: string;
}

const SchoolCollaboration: React.FC<SchoolCollaborationProps> = ({
  teacherId,
  teacherName
}) => {
  const [schools, setSchools] = useState<{[key: string]: Teacher[]}>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load all teachers
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    
    // Group teachers by school
    const schoolMap: {[key: string]: Teacher[]} = {};
    
    teachers.forEach((teacher: Teacher) => {
      if (teacher.schools && teacher.schools.length > 0) {
        teacher.schools.forEach(school => {
          if (!schoolMap[school]) {
            schoolMap[school] = [];
          }
          schoolMap[school].push({
            id: teacher.id,
            displayName: teacher.displayName,
            username: teacher.username
          });
        });
      }
    });
    
    setSchools(schoolMap);
    
    // Load all classes
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    setClasses(allClasses);
    
    // Load merge requests
    const requests = JSON.parse(localStorage.getItem("mergeRequests") || "[]");
    setMergeRequests(requests);
  }, []);
  
  const handleSendMergeRequest = () => {
    if (!selectedClass) return;
    
    // Create a new merge request
    const newRequest: MergeRequest = {
      id: `req-${Date.now()}`,
      fromTeacherId: teacherId,
      fromTeacherName: teacherName,
      toTeacherId: selectedClass.teacherId,
      classId: selectedClass.id,
      className: selectedClass.name,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Add to existing requests
    const updatedRequests = [...mergeRequests, newRequest];
    setMergeRequests(updatedRequests);
    
    // Save to localStorage
    localStorage.setItem("mergeRequests", JSON.stringify(updatedRequests));
    
    // Update the class with the pending request
    const updatedClasses = classes.map(cls => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          pendingRequests: [...(cls.pendingRequests || []), teacherId]
        };
      }
      return cls;
    });
    
    setClasses(updatedClasses);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Close dialog and show toast
    setIsDialogOpen(false);
    toast({
      title: "Request sent",
      description: `Merge request sent for ${selectedClass.name}`
    });
  };
  
  const handleAcceptRequest = (request: MergeRequest) => {
    // Update the request status
    const updatedRequests = mergeRequests.map(req => {
      if (req.id === request.id) {
        return { ...req, status: "accepted" };
      }
      return req;
    });
    
    setMergeRequests(updatedRequests);
    localStorage.setItem("mergeRequests", JSON.stringify(updatedRequests));
    
    // Update the class to add the collaborator
    const updatedClasses = classes.map(cls => {
      if (cls.id === request.classId) {
        return {
          ...cls,
          collaborators: [...(cls.collaborators || []), request.fromTeacherId],
          pendingRequests: (cls.pendingRequests || []).filter(
            id => id !== request.fromTeacherId
          )
        };
      }
      return cls;
    });
    
    setClasses(updatedClasses);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    toast({
      title: "Request accepted",
      description: `You are now collaborating on ${request.className}`
    });
  };
  
  const handleRejectRequest = (request: MergeRequest) => {
    // Update the request status
    const updatedRequests = mergeRequests.map(req => {
      if (req.id === request.id) {
        return { ...req, status: "rejected" };
      }
      return req;
    });
    
    setMergeRequests(updatedRequests);
    localStorage.setItem("mergeRequests", JSON.stringify(updatedRequests));
    
    // Update the class to remove the pending request
    const updatedClasses = classes.map(cls => {
      if (cls.id === request.classId) {
        return {
          ...cls,
          pendingRequests: (cls.pendingRequests || []).filter(
            id => id !== request.fromTeacherId
          )
        };
      }
      return cls;
    });
    
    setClasses(updatedClasses);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    toast({
      title: "Request rejected",
      description: `You declined collaboration on ${request.className}`
    });
  };
  
  // Get classes available for current teacher to view (own + same school)
  const getTeacherSchools = () => {
    const currentTeacher = JSON.parse(localStorage.getItem("teachers") || "[]").find(
      (t: Teacher) => t.id === teacherId
    );
    return currentTeacher?.schools || [];
  };
  
  const teacherSchools = getTeacherSchools();
  const incomingRequests = mergeRequests.filter(
    req => req.toTeacherId === teacherId && req.status === "pending"
  );
  const outgoingRequests = mergeRequests.filter(
    req => req.fromTeacherId === teacherId
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-500" />
            School Collaboration
          </CardTitle>
          <CardDescription>
            View and manage collaboration with other teachers in your schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherSchools.length > 0 ? (
            <div className="space-y-4">
              {teacherSchools.map(schoolName => (
                <div key={schoolName} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">{schoolName}</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Teachers in this school:
                    </h4>
                    
                    {schools[schoolName] && schools[schoolName].length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {schools[schoolName].map(teacher => (
                          <Badge 
                            key={teacher.id} 
                            variant="outline"
                            className={teacher.id === teacherId ? "bg-blue-100" : ""}
                          >
                            {teacher.displayName}
                            {teacher.id === teacherId && " (You)"}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No other teachers in this school yet.</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Classes in this school:
                    </h4>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes
                          .filter(cls => cls.school === schoolName)
                          .map(cls => {
                            const isOwner = cls.teacherId === teacherId;
                            const isCollaborator = cls.collaborators?.includes(teacherId);
                            const hasPendingRequest = cls.pendingRequests?.includes(teacherId);
                            const ownerTeacher = schools[schoolName]?.find(
                              t => t.id === cls.teacherId
                            );
                            
                            return (
                              <TableRow key={cls.id}>
                                <TableCell>{cls.name}</TableCell>
                                <TableCell>
                                  {ownerTeacher ? ownerTeacher.displayName : "Unknown"}
                                  {isOwner && " (You)"}
                                </TableCell>
                                <TableCell>
                                  {isOwner && <Badge>Owner</Badge>}
                                  {isCollaborator && <Badge className="bg-green-500">Collaborator</Badge>}
                                  {hasPendingRequest && <Badge variant="outline">Request Sent</Badge>}
                                  {!isOwner && !isCollaborator && !hasPendingRequest && (
                                    <Badge variant="outline" className="bg-gray-100">View Only</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {!isOwner && !isCollaborator && !hasPendingRequest && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedClass(cls);
                                        setIsDialogOpen(true);
                                      }}
                                    >
                                      <Merge className="h-4 w-4 mr-1" />
                                      Request Merge
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Schools Yet</h3>
              <p className="text-gray-500">
                Create a class with a school name to start collaborating with other teachers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {incomingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Incoming Collaboration Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.fromTeacherName}</TableCell>
                    <TableCell>{request.className}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleAcceptRequest(request)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500"
                          onClick={() => handleRejectRequest(request)}
                        >
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
      
      {outgoingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Collaboration Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outgoingRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.className}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
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
                         "Rejected"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Merge Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Collaboration</DialogTitle>
            <DialogDescription>
              Send a request to collaborate on this class with the teacher who created it.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="py-4">
              <p>
                <span className="font-semibold">Class:</span> {selectedClass.name}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Once accepted, you'll be able to collaborate on this class based on the permissions
                granted by the teacher.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMergeRequest}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolCollaboration;
