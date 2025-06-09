
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Phone, MessageCircle } from "lucide-react";
import { SocialLinks } from "@/hooks/useTeacherProfile";

interface ProfileSocialTabProps {
  socialLinks?: SocialLinks;
  isEditing: boolean;
  onSocialLinkUpdate: (platform: keyof SocialLinks, value: string) => void;
}

export const ProfileSocialTab: React.FC<ProfileSocialTabProps> = ({
  socialLinks,
  isEditing,
  onSocialLinkUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Social Media & Contact
        </CardTitle>
        <p className="text-sm text-gray-500">
          {isEditing ? "Update your contact information" : "Contact information"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                value={socialLinks?.phone || ''}
                onChange={(e) => onSocialLinkUpdate('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="text-gray-700 p-2 bg-gray-50 rounded">
                {socialLinks?.phone || 'Not provided'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Label>
            {isEditing ? (
              <Input
                id="whatsapp"
                value={socialLinks?.whatsapp || ''}
                onChange={(e) => onSocialLinkUpdate('whatsapp', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="text-gray-700 p-2 bg-gray-50 rounded">
                {socialLinks?.whatsapp || 'Not provided'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            {isEditing ? (
              <Input
                id="instagram"
                value={socialLinks?.instagram || ''}
                onChange={(e) => onSocialLinkUpdate('instagram', e.target.value)}
                placeholder="@username"
              />
            ) : (
              <p className="text-gray-700 p-2 bg-gray-50 rounded">
                {socialLinks?.instagram || 'Not provided'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="line" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              LINE
            </Label>
            {isEditing ? (
              <Input
                id="line"
                value={socialLinks?.line || ''}
                onChange={(e) => onSocialLinkUpdate('line', e.target.value)}
                placeholder="LINE ID"
              />
            ) : (
              <p className="text-gray-700 p-2 bg-gray-50 rounded">
                {socialLinks?.line || 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
