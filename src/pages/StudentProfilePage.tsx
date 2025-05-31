
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";
import { ProfileTabs } from "@/components/student-profile/ProfileTabs";
import { supabase } from "@/integrations/supabase/client";

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // Check if this is the current user's profile
  const currentUserId = localStorage.getItem("currentStudentId");
  const isOwner = currentUserId === studentId;

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    if (!studentId) return;
    
    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const studentData = {
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          avatar: null, // Add avatar logic if needed
          photos: [], // Initialize empty photos array
          pokemonCollection: [], // Initialize empty pokemon collection
          contactInfo: '', // Initialize empty contact info
          classId: data.class_id
        };
        setStudent(studentData);
        setEditData(studentData);
      }
    } catch (error) {
      console.error("Error loading from Supabase, falling back to localStorage:", error);
      
      // Fallback to localStorage
      const savedStudents = localStorage.getItem("students");
      if (savedStudents) {
        const students = JSON.parse(savedStudents);
        const foundStudent = students.find((s: any) => s.id === studentId);
        if (foundStudent) {
          const studentData = {
            id: foundStudent.id,
            username: foundStudent.username,
            displayName: foundStudent.displayName || foundStudent.username,
            avatar: foundStudent.avatar,
            photos: foundStudent.photos || [],
            pokemonCollection: foundStudent.pokemonCollection || [],
            contactInfo: foundStudent.contactInfo || '',
            classId: foundStudent.classId
          };
          setStudent(studentData);
          setEditData(studentData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    setStudent(editData);
    // The ProfileSidebar component handles the actual saving
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset any changes
    setEditData(student);
  };

  const handleSendMessage = () => {
    navigate("/messages", { state: { recipientId: studentId, recipientName: student?.displayName || student?.username } });
  };

  const handleAddFriend = () => {
    setFriendRequestSent(true);
    // Implement friend request logic here
  };

  const handleEditDataChange = (newData: any) => {
    setEditData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("student-not-found")}</h2>
          <Button onClick={() => navigate(-1)}>{t("go-back")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
          
          {!isOwner && (
            <Button
              onClick={handleSendMessage}
              className="flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("send-message")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              student={student}
              isOwner={isOwner}
              isEditing={isEditing}
              friendRequestSent={friendRequestSent}
              onEditClick={handleEditClick}
              onSendMessageClick={handleSendMessage}
              onAddFriendClick={handleAddFriend}
              onSaveClick={handleSaveClick}
              onCancelClick={handleCancelClick}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProfileTabs 
              student={student}
              isEditing={isEditing}
              editData={editData}
              onEditDataChange={handleEditDataChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
