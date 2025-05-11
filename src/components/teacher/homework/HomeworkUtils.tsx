
import React from "react";
import { FileText, Image, Mic } from "lucide-react";

// Helper function to get the appropriate icon based on homework type
export const getHomeworkTypeIcon = (type: string) => {
  switch (type) {
    case "text": return <FileText className="h-5 w-5 text-blue-500" />;
    case "image": return <Image className="h-5 w-5 text-green-500" />;
    case "audio": return <Mic className="h-5 w-5 text-purple-500" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

// Icon components with proper TypeScript props
interface IconProps {
  className?: string;
}

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);
