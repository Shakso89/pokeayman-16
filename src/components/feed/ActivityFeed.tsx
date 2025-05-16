
import React from "react";
import { useActivityFeed } from "@/hooks/useRealtimeSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityFeedProps {
  userId?: string;
  global?: boolean;
  title?: string;
  maxItems?: number;
}

export default function ActivityFeed({ 
  userId, 
  global = false, 
  title = "Activity Feed", 
  maxItems = 10 
}: ActivityFeedProps) {
  const { t } = useTranslation();
  const { activities, loading, error } = useActivityFeed(userId, global);
  
  // Query to fetch user information for each activity
  const { data: userInfo } = useQuery({
    queryKey: ['users-info', activities.map(a => a.user_id).join(',')],
    queryFn: async () => {
      if (!activities.length) return {};
      
      // Get unique user IDs
      const userIds = [...new Set(activities.map(a => a.user_id))];
      
      // Fetch user data from appropriate tables
      const { data: teachers } = await supabase
        .from('teachers')
        .select('id, username, display_name')
        .in('id', userIds);
        
      const { data: students } = await supabase
        .from('students')
        .select('id, username, display_name')
        .in('id', userIds);
        
      // Combine results into a map of id -> user info
      const userMap: Record<string, { username: string, displayName: string }> = {};
      
      teachers?.forEach(teacher => {
        userMap[teacher.id] = {
          username: teacher.username,
          displayName: teacher.display_name
        };
      });
      
      students?.forEach(student => {
        userMap[student.id] = {
          username: student.username,
          displayName: student.display_name || student.username
        };
      });
      
      return userMap;
    },
    enabled: activities.length > 0
  });
  
  const getUserInfo = (userId: string) => {
    if (!userInfo) return { username: 'unknown', displayName: 'Unknown User' };
    return userInfo[userId] || { username: 'unknown', displayName: 'Unknown User' };
  };
  
  const renderActivityContent = (activity: any) => {
    const { activity_type, details, created_at } = activity;
    const user = getUserInfo(activity.user_id);
    const formattedTime = formatDistanceToNow(new Date(created_at), { addSuffix: true });
    
    switch (activity_type) {
      case 'collected_pokemon':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={details.pokemon_image} />
              <AvatarFallback>{details.pokemon_name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                <span className="text-blue-600">{user.displayName}</span> collected a new Pokémon
              </p>
              <p className="text-sm text-gray-500">
                {details.pokemon_name} ({details.pokemon_level || 'Level 1'})
              </p>
              <p className="text-xs text-gray-400">{formattedTime}</p>
            </div>
          </div>
        );
        
      case 'joined_class':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                <span className="text-blue-600">{user.displayName}</span> joined a new class
              </p>
              <p className="text-sm text-gray-500">{details.class_name}</p>
              <p className="text-xs text-gray-400">{formattedTime}</p>
            </div>
          </div>
        );
        
      case 'completed_homework':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                <span className="text-blue-600">{user.displayName}</span> completed homework
              </p>
              <p className="text-sm text-gray-500">{details.homework_title}</p>
              <p className="text-xs text-gray-400">{formattedTime}</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                <span className="text-blue-600">{user.displayName}</span> {activity_type.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-400">{formattedTime}</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            {t("error-loading-feed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            {t("no-activities-yet")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, maxItems).map((activity) => (
            <div key={activity.id} className="border-b pb-4 last:border-0">
              {renderActivityContent(activity)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
