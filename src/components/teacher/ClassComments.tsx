
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Comment {
  id: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  content: string;
  createdAt: string;
}

interface ClassCommentsProps {
  classId: string;
  teacherId: string;
}

const ClassComments: React.FC<ClassCommentsProps> = ({ classId, teacherId }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [teacherData, setTeacherData] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadComments();
    loadTeacherData();
  }, [classId]);

  const loadComments = () => {
    const allComments = JSON.parse(localStorage.getItem("classComments") || "[]");
    const classComments = allComments.filter((comment: Comment) => comment.classId === classId);
    
    // Sort comments by creation date (newest first)
    classComments.sort((a: Comment, b: Comment) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setComments(classComments);
  };

  const loadTeacherData = () => {
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacherMap: {[key: string]: any} = {};
    
    teachers.forEach((teacher: any) => {
      teacherMap[teacher.id] = {
        displayName: teacher.displayName,
        avatar: teacher.avatar
      };
    });
    
    setTeacherData(teacherMap);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast({
        title: t("error"),
        description: t("comment-cannot-be-empty"),
        variant: "destructive"
      });
      return;
    }
    
    // Get current teacher data
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const currentTeacher = teachers.find((teacher: any) => teacher.id === teacherId);
    
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      classId,
      teacherId,
      teacherName: currentTeacher?.displayName || localStorage.getItem("teacherUsername") || "Teacher",
      teacherAvatar: currentTeacher?.avatar,
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingComments = JSON.parse(localStorage.getItem("classComments") || "[]");
    const updatedComments = [newCommentObj, ...existingComments];
    localStorage.setItem("classComments", JSON.stringify(updatedComments));
    
    // Update state
    setComments([newCommentObj, ...comments]);
    setNewComment("");
    
    toast({
      title: t("success"),
      description: t("comment-added")
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("comments")}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Textarea 
              placeholder={t("write-comment")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <Button 
              className="self-end"
              onClick={handleAddComment}
            >
              {t("post")}
            </Button>
          </div>
          
          <div className="space-y-6 mt-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.teacherAvatar} alt={comment.teacherName} />
                    <AvatarFallback>
                      {comment.teacherName && comment.teacherName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-medium">{comment.teacherName}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">{t("no-comments-yet")}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassComments;
