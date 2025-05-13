
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Contact, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      <DialogContent className="bg-black/80 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Get Your Activation Code</DialogTitle>
          <DialogDescription className="text-gray-300">
            Contact us to activate your account and unlock all features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">Email:</span>
            <a 
              href="mailto:ayman.pokeayman.com" 
              className="text-blue-400 hover:underline flex items-center gap-2"
              onClick={() => copyToClipboard("ayman.pokeayman.com", "Email")}
            >
              <div className="bg-blue-900/50 p-2 rounded-full">
                <Mail className="h-4 w-4 text-blue-400" />
              </div>
              ayman.pokeayman.com
            </a>
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">Facebook:</span>
            <a 
              href="https://www.facebook.com/ayman.soliman89/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-2"
              onClick={() => console.log("Contact attempt via Facebook: ayman.soliman89")}
            >
              <div className="bg-blue-900/50 p-2 rounded-full">
                <Contact className="h-4 w-4 text-blue-400" />
              </div>
              ayman.soliman89
            </a>
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">Phone / WhatsApp / Line:</span>
            <a 
              href="tel:+886900170038" 
              className="text-blue-400 hover:underline flex items-center gap-2"
              onClick={() => copyToClipboard("+886900170038", "Phone number")}
            >
              <div className="bg-blue-900/50 p-2 rounded-full">
                <Phone className="h-4 w-4 text-blue-400" />
              </div>
              +886 900 170 038
            </a>
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">LINE:</span>
            <a 
              href="https://line.me/ti/p/R2zf7rn9Mt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-2"
              onClick={() => console.log("Contact attempt via LINE")}
            >
              <div className="bg-green-900/50 p-2 rounded-full">
                <MessageCircle className="h-4 w-4 text-green-400" />
              </div>
              Click to connect on LINE
            </a>
          </div>
          
          <div className="text-sm text-gray-400 mt-2">
            <p>Available activation codes:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>7-day trial (starts with "TRIAL")</li>
              <li>Monthly subscription (starts with "MONTH")</li>
              <li>Annual subscription (starts with "YEAR")</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
