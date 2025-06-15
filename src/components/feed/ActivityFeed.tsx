
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Award, Coins, BookText, UserPlus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
  maxItems = 20
}: ActivityFeedProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading: loading, error } = useQuery({
    queryKey: ['user-activities', { userId, global }],
    queryFn: async () => {
      let query = supabase.from('user_activities').select('*, user:user_id(id, display_name, username)');

      if (global) {
        // For a global feed, might need more complex logic later. For now, public activities.
        query = query.eq('is_public', true);
      } else if (userId) {
        // Fetch activities related to classes the student is in.
        const { data: classLinks } = await supabase.from('student_classes').select('class_id').eq('student_id', userId);
        if (classLinks && classLinks.length > 0) {
          const classIds = classLinks.map(c => c.class_id);
          query = query.in('class_id', classIds);
        } else {
            // No classes, so no class-related activities
            return [];
        }
      } else {
          return [];
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(maxItems);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  useEffect(() => {
    const channel = supabase
      .channel('user-activities-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_activities' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['user-activities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const { data: userInfo } = useQuery({
    queryKey: ['users-info-feed', activities.map(a => a.user_id).join(',')],
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
    const performer = getUserInfo(activity.user_id);
    const formattedTime = formatDistanceToNow(new Date(created_at), { addSuffix: true });
    
    let icon;
    let content;

    switch (activity_type) {
      case 'awarded_coins':
        icon = <Coins className="h-6 w-6 text-yellow-500" />;
        content = (
          <p>
            <span className="font-semibold text-blue-600">{performer.displayName}</span> awarded {details.amount} coins to <span className="font-semibold">{details.studentName}</span>.
          </p>
        );
        break;
      case 'assigned_pokemon':
        icon = <Award className="h-6 w-6 text-purple-500" />;
        content = (
          <p>
            <span className="font-semibold text-blue-600">{performer.displayName}</span> assigned Pokémon <span className="font-semibold">{details.pokemonName}</span> to <span className="font-semibold">{details.studentName}</span>.
          </p>
        );
        break;
      case 'created_homework':
        icon = <BookText className="h-6 w-6 text-green-500" />;
        content = (
          <p>
            <span className="font-semibold text-blue-600">{performer.displayName}</span> created new homework: <span className="font-semibold">"{details.homeworkTitle}"</span>.
          </p>
        );
        break;
      case 'added_student_to_class':
        icon = <UserPlus className="h-6 w-6 text-indigo-500" />;
        content = (
          <p>
            <span className="font-semibold text-blue-600">{performer.displayName}</span> added <span className="font-semibold">{details.studentName}</span> to the class.
          </p>
        );
        break;
      default:
        icon = <div className="h-6 w-6"></div>
        content = (
          <p>
            <span className="font-semibold text-blue-600">{performer.displayName}</span> performed an action: {activity_type.replace(/_/g, ' ')}.
          </p>
        );
    }
    
    return (
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">{icon}</div>
        <div className="flex-1">
          {content}
          <p className="text-xs text-gray-500 mt-1">{formattedTime}</p>
        </div>
      </div>
    );
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
          {activities.map((activity) => (
            <div key={activity.id} className="border-b pb-4 last:border-0 last:pb-0">
              {renderActivityContent(activity)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
