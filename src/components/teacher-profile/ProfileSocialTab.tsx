
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Instagram, Phone } from "lucide-react";
import { SocialLinks } from "@/hooks/useTeacherProfile";

interface ProfileSocialTabProps {
  socialLinks?: SocialLinks;
  isEditing: boolean;
  onSocialLinkUpdate: (network: keyof SocialLinks, value: string) => void;
}

export const ProfileSocialTab: React.FC<ProfileSocialTabProps> = ({
  socialLinks = {},
  isEditing,
  onSocialLinkUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media</CardTitle>
        <p className="text-sm text-gray-500">Optional contact information</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Line */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              L
            </div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  placeholder="Line ID"
                  value={socialLinks?.line || ''}
                  onChange={(e) => onSocialLinkUpdate('line', e.target.value)}
                />
              ) : (
                <p>
                  {socialLinks?.line ? (
                    socialLinks.line
                  ) : (
                    <span className="text-gray-400">No Line ID provided</span>
                  )}
                </p>
              )}
            </div>
          </div>
          
          {/* WhatsApp */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
              W
            </div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  placeholder="WhatsApp Number"
                  value={socialLinks?.whatsapp || ''}
                  onChange={(e) => onSocialLinkUpdate('whatsapp', e.target.value)}
                />
              ) : (
                <p>
                  {socialLinks?.whatsapp ? (
                    socialLinks.whatsapp
                  ) : (
                    <span className="text-gray-400">No WhatsApp number provided</span>
                  )}
                </p>
              )}
            </div>
          </div>
          
          {/* Instagram */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Instagram className="h-4 w-4" />
            </div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  placeholder="Instagram Username"
                  value={socialLinks?.instagram || ''}
                  onChange={(e) => onSocialLinkUpdate('instagram', e.target.value)}
                />
              ) : (
                <p>
                  {socialLinks?.instagram ? (
                    socialLinks.instagram
                  ) : (
                    <span className="text-gray-400">No Instagram username provided</span>
                  )}
                </p>
              )}
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  placeholder="Phone Number"
                  value={socialLinks?.phone || ''}
                  onChange={(e) => onSocialLinkUpdate('phone', e.target.value)}
                />
              ) : (
                <p>
                  {socialLinks?.phone ? (
                    socialLinks.phone
                  ) : (
                    <span className="text-gray-400">No phone number provided</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
