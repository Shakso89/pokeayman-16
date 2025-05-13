
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
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-blue-600 p-3 rounded-full">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">Email:</span>
              <a 
                href="mailto:ayman@pokeayman.com" 
                className="text-blue-300 hover:underline block"
                onClick={() => copyToClipboard("ayman@pokeayman.com", "Email")}
              >
                ayman@pokeayman.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-pink-600 p-3 rounded-full">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">Instagram:</span>
              <a 
                href="https://www.instagram.com/shakso/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:underline block"
                onClick={() => console.log("Contact attempt via Instagram: @shakso")}
              >
                @shakso
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-blue-600 p-3 rounded-full">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">Phone:</span>
              <a 
                href="tel:+886900170038" 
                className="text-blue-300 hover:underline block"
                onClick={() => copyToClipboard("+886900170038", "Phone number")}
              >
                +886 900 170 038
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-green-600 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">LINE:</span>
              <a 
                href="https://line.me/ti/p/R2zf7rn9Mt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:underline block"
                onClick={() => console.log("Contact attempt via LINE")}
              >
                Click to connect on LINE
              </a>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
