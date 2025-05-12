
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface AccessRequest {
  id: string;
  classId: string;
  requesterId: string;
  ownerTeacherId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

interface Teacher {
  id: string;
  displayName: string;
  avatar?: string;
}

interface ClassData {
  id: string;
  name: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  controllers?: string[];
}

interface AccessRequestsTabProps {
  teacherId: string;
}

const AccessRequestsTab: React.FC<AccessRequestsTabProps> = ({ teacherId }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [teacherData, setTeacherData] = useState<{[key: string]: Teacher}>({});
  const [classData, setClassData] = useState<{[key: string]: ClassData}>({});
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    loadRequestsData();
    loadTeacherData();
    loadClassData();
  }, [teacherId]);

  const loadRequestsData = () => {
    const allRequests = JSON.parse(localStorage.getItem("accessRequests") || "[]");
    setRequests(allRequests);
  };

  const loadTeacherData = () => {
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacherMap: {[key: string]: Teacher} = {};
    
    teachers.forEach((teacher: Teacher) => {
      teacherMap[teacher.id] = teacher;
    });
    
    setTeacherData(teacherMap);
  };

  const loadClassData = () => {
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const classMap: {[key: string]: ClassData} = {};
    
    allClasses.forEach((cls: ClassData) => {
      classMap[cls.id] = cls;
    });
    
    setClassData(classMap);
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;
    
    // Update request status
    const updatedRequests = requests.map(req => 
      req.id === requestId ? {...req, status: "approved" as const} : req
    );
    localStorage.setItem("accessRequests", JSON.stringify(updatedRequests));
    
    // Update class controllers
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = allClasses.map((cls: ClassData) => {
      if (cls.id === request.classId) {
        const controllers = cls.controllers || [];
        if (!controllers.includes(request.requesterId)) {
          return {
            ...cls,
            controllers: [...controllers, request.requesterId]
          };
        }
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Update state
    setRequests(updatedRequests);
    
    toast({
      title: t("success"),
      description: t("access-request-approved")
    });
  };

  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = requests.map(req => 
      req.id === requestId ? {...req, status: "rejected" as const} : req
    );
    localStorage.setItem("accessRequests", JSON.stringify(updatedRequests));
    
    // Update state
    setRequests(updatedRequests);
    
    toast({
      title: t("info"),
      description: t("access-request-rejected")
    });
  };

  const incomingRequests = requests.filter(
    req => req.ownerTeacherId === teacherId && req.status === "pending"
  );

  const outgoingRequests = requests.filter(
    req => req.requesterId === teacherId
  );

  const getTeacherName = (teacherId: string): string => {
    return teacherData[teacherId]?.displayName || "Teacher";
  };

  const getTeacherAvatar = (teacherId: string): string | undefined => {
    return teacherData[teacherId]?.avatar;
  };

  const getClassName = (classId: string): string => {
    return classData[classId]?.name || "Unknown Class";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("access-requests")}</CardTitle>
        <div className="flex space-x-2 mt-2">
          <Button 
            variant={activeTab === "incoming" ? "default" : "outline"}
            onClick={() => setActiveTab("incoming")}
            size="sm"
          >
            {t("incoming")} ({incomingRequests.length})
          </Button>
          <Button 
            variant={activeTab === "outgoing" ? "default" : "outline"}
            onClick={() => setActiveTab("outgoing")}
            size="sm"
          >
            {t("outgoing")} ({outgoingRequests.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "incoming" ? (
          incomingRequests.length > 0 ? (
            <div className="space-y-4">
              {incomingRequests.map(request => (
                <div key={request.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getTeacherAvatar(request.requesterId)} alt={getTeacherName(request.requesterId)} />
                      <AvatarFallback>
                        {getTeacherName(request.requesterId).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getTeacherName(request.requesterId)}</p>
                      <p className="text-sm text-gray-500">
                        {t("requesting-access-to")} <span className="font-medium">{getClassName(request.classId)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRejectRequest(request.id)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("reject")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleApproveRequest(request.id)}
                      className="text-green-500"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t("approve")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">{t("no-incoming-requests")}</p>
          )
        ) : (
          outgoingRequests.length > 0 ? (
            <div className="space-y-4">
              {outgoingRequests.map(request => (
                <div key={request.id} className="p-3 border rounded-md">
                  <p className="font-medium">{getClassName(request.classId)}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {t("requested-at")} {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {request.status === "approved" 
                        ? t("approved") 
                        : request.status === "rejected"
                        ? t("rejected")
                        : t("pending")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">{t("no-outgoing-requests")}</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default AccessRequestsTab;
