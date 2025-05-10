
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Contact } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Your Activation Code</DialogTitle>
          <DialogDescription>
            Contact us to get a trial, monthly, or annual activation code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">Facebook:</span>
            <a 
              href="https://www.facebook.com/ayman.soliman89/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-2"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <Contact className="h-4 w-4 text-blue-500" />
              </div>
              ayman.soliman89
            </a>
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-medium mb-1">Phone / WhatsApp / Line:</span>
            <a 
              href="tel:+886900170038" 
              className="text-blue-500 hover:underline flex items-center gap-2"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <Contact className="h-4 w-4 text-blue-500" />
              </div>
              +886 900 170 038
            </a>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Available activation codes:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>7-day trial (starts with "TRIAL")</li>
              <li>Monthly subscription (starts with "MONTH")</li>
              <li>Annual subscription (starts with "YEAR")</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
