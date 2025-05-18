import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Mail, Phone, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  displayText: string;
  href: string;
  onClick?: () => void;
  external?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, label, displayText, href, onClick, external }) => (
  <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
    <div className="p-3 rounded-full bg-opacity-80">{icon}</div>
    <div className="flex-1">
      <span className="font-medium text-white">{label}</span>
      <a
        href={href}
        className="text-blue-300 hover:underline block"
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {displayText}
      </a>
    </div>
  </div>
);

const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose }) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
    console.log(`Contact attempt via ${type}: ${text}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90 text-white border-gray-700 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact Us</DialogTitle>
          <DialogDescription className="text-gray-300">
            Contact us to learn more about our credit system and features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <ContactItem
            icon={<Mail className="h-6 w-6 text-white bg-blue-600 p-1.5 rounded-full" />}
            label="Email:"
            displayText="ayman@pokeayman.com"
            href="mailto:ayman@pokeayman.com"
            onClick={() => copyToClipboard("ayman@pokeayman.com", "Email")}
          />
          <ContactItem
            icon={<Instagram className="h-6 w-6 text-white bg-pink-600 p-1.5 rounded-full" />}
            label="Instagram:"
            displayText="@shakso"
            href="https://www.instagram.com/shakso/"
            onClick={() => console.log("Contact attempt via Instagram: @shakso")}
            external
          />
          <ContactItem
            icon={<Phone className="h-6 w-6 text-white bg-blue-600 p-1.5 rounded-full" />}
            label="Phone:"
            displayText="+886 900 170 038"
            href="tel:+886900170038"
            onClick={() => copyToClipboard("+886900170038", "Phone number")}
          />
          <ContactItem
            icon={<MessageCircle className="h-6 w-6 text-white bg-green-600 p-1.5 rounded-full" />}
            label="LINE:"
            displayText="Click to connect on LINE"
            href="https://line.me/ti/p/R2zf7rn9Mt"
            onClick={() => console.log("Contact attempt via LINE")}
            external
          />
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
