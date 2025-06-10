
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProfilePhotosTab } from "./ProfilePhotosTab";
import { ProfileStudentsTab } from "./ProfileStudentsTab";
import { ProfileSocialTab } from "./ProfileSocialTab";
import { TeacherProfileData, SocialLinks } from "@/hooks/useTeacherProfile";
import { useTeacherProfileSave } from "@/hooks/useTeacherProfileSave";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";

interface ProfileTabsProps {
  teacher: TeacherProfileData | null;
  isEditing: boolean;
  isOwner: boolean;
  studentCount: number;
  editData: Partial<TeacherProfileData>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<TeacherProfileData>>>;
  updateSocialLink: (network: keyof SocialLinks, value: string) => void;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  teacher,
  isEditing,
  isOwner,
  studentCount,
  editData,
  setEditData,
  updateSocialLink,
  onSave,
  hasUnsavedChanges = false
}) => {
  const { saveProfile, isSaving } = useTeacherProfileSave();

  const handleSave = async () => {
    if (!teacher?.id) return;
    
    const success = await saveProfile(teacher.id, {
      display_name: editData.displayName,
      email: editData.email,
      social_links: editData.socialLinks,
      photos: editData.photos
    });

    if (success && onSave) {
      onSave();
    }
  };

  return (
    <div className="space-y-4">
      {/* Save indicator and button */}
      {isEditing && isOwner && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-orange-700">You have unsaved changes</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">All changes saved</span>
              </>
            )}
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        {/* Photos Tab */}
        <TabsContent value="photos">
          <ProfilePhotosTab 
            photos={isEditing ? editData.photos || [] : teacher?.photos || []}
            isEditing={isEditing}
            isOwner={isOwner}
            onPhotosChange={photos => setEditData({...editData, photos})}
          />
        </TabsContent>
        
        {/* Students Tab */}
        <TabsContent value="students">
          <ProfileStudentsTab 
            teacherId={teacher?.id || ''}
            studentCount={studentCount} 
          />
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
    </div>
  );
};
