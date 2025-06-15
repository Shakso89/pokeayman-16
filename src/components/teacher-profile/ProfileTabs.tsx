
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePhotosTab } from "./ProfilePhotosTab";
import { ProfileStudentsTab } from "./ProfileStudentsTab";
import { ProfileSocialTab } from "./ProfileSocialTab";
import { TeacherProfileData, SocialLinks } from "@/hooks/useTeacherProfile";
import { ProfileClassesTab } from "./ProfileClassesTab";

interface ProfileTabsProps {
  teacher: TeacherProfileData | null;
  isEditing: boolean;
  isOwner: boolean;
  studentCount: number;
  editData: Partial<TeacherProfileData>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<TeacherProfileData>>>;
  updateSocialLink: (network: keyof SocialLinks, value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  teacher,
  isEditing,
  isOwner,
  studentCount,
  editData,
  setEditData,
  updateSocialLink,
  activeTab,
  onTabChange,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="classes">Classes</TabsTrigger>
        <TabsTrigger value="social">Social Media</TabsTrigger>
      </TabsList>

      {/* Photos Tab */}
      <TabsContent value="photos">
        <ProfilePhotosTab
          photos={isEditing ? editData.photos || [] : teacher?.photos || []}
          isEditing={isEditing}
          isOwner={isOwner}
          onPhotosChange={(photos) => setEditData({ ...editData, photos })}
        />
      </TabsContent>

      {/* Students Tab */}
      <TabsContent value="students">
        <ProfileStudentsTab
          teacherId={teacher?.id || ""}
          studentCount={studentCount}
        />
      </TabsContent>

      {/* Classes Tab */}
      <TabsContent value="classes">
        <ProfileClassesTab classes={teacher?.classes || []} />
      </TabsContent>

      {/* Social Media Tab */}
      <TabsContent value="social">
        <ProfileSocialTab
          socialLinks={isEditing ? editData.socialLinks : teacher?.socialLinks}
          isEditing={isEditing}
          onSocialLinkUpdate={updateSocialLink}
        />
      </TabsContent>
    </Tabs>
  );
};
