import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MessageCircle, Instagram, CreditCard, Check } from "lucide-react";
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
const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  label,
  displayText,
  href,
  onClick,
  external
}) => <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors">
    <div className="p-3 rounded-full bg-opacity-80">{icon}</div>
    <div className="flex-1">
      <span className="font-medium text-white">{label}</span>
      <a href={href} className="text-blue-300 hover:underline block" onClick={onClick} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {displayText}
      </a>
    </div>
  </div>;
interface PricingPlanProps {
  title: string;
  credits: number;
  price: string;
  bestFor: string;
  isPopular?: boolean;
}
const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  credits,
  price,
  bestFor,
  isPopular
}) => <div className={`glass-card rounded-xl p-6 relative ${isPopular ? 'ring-2 ring-yellow-400' : ''}`}>
    {isPopular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
          Most Popular
        </span>
      </div>}
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <div className="text-3xl font-bold text-yellow-400 mb-1">{price}</div>
      <div className="text-white/80 mb-4">{credits} Credits</div>
      <div className="text-white/70 text-sm mb-6">{bestFor}</div>
      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
        <CreditCard className="w-4 h-4 mr-2" />
        Purchase Plan
      </Button>
    </div>
    <div className="mt-4 space-y-2">
      <div className="flex items-center text-white/80 text-sm">
        <Check className="w-4 h-4 mr-2 text-green-400" />
        Instant credit delivery
      </div>
      <div className="flex items-center text-white/80 text-sm">
        <Check className="w-4 h-4 mr-2 text-green-400" />
        No expiration date
      </div>
      <div className="flex items-center text-white/80 text-sm">
        <Check className="w-4 h-4 mr-2 text-green-400" />
        24/7 support included
      </div>
    </div>
  </div>;
const ContactDialog: React.FC<ContactDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState("contact");
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`
    });
    console.log(`Contact attempt via ${type}: ${text}`);
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90 text-white border-gray-700 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact & Pricing</DialogTitle>
          <DialogDescription className="text-gray-300">
            Get in touch with us or choose a credit plan that fits your needs.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="contact" className="text-white data-[state=active]:bg-white/20">
              Contact Us
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-white data-[state=active]:bg-white/20">
              💳 Pricing Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4 mt-6">
            <div className="grid gap-5">
              <ContactItem icon={<Mail className="h-6 w-6 text-white bg-blue-600 p-1.5 rounded-full" />} label="Email:" displayText="ayman@pokeayman.com" href="mailto:ayman@pokeayman.com" onClick={() => copyToClipboard("ayman@pokeayman.com", "Email")} />
              <ContactItem icon={<Instagram className="h-6 w-6 text-white bg-pink-600 p-1.5 rounded-full" />} label="Instagram:" displayText="@shakso" href="https://www.instagram.com/shakso/" onClick={() => console.log("Contact attempt via Instagram: @shakso")} external />
              <ContactItem icon={<Phone className="h-6 w-6 text-white bg-blue-600 p-1.5 rounded-full" />} label="Phone:" displayText="+886 900 170 038" href="tel:+886900170038" onClick={() => copyToClipboard("+886900170038", "Phone number")} />
              <ContactItem icon={<MessageCircle className="h-6 w-6 text-white bg-green-600 p-1.5 rounded-full" />} label="LINE:" displayText="Click to connect on LINE" href="https://line.me/ti/p/R2zf7rn9Mt" onClick={() => console.log("Contact attempt via LINE")} external />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">💳 Credit Purchase Plans (NTD)</h3>
              <p className="text-white/80">Choose the perfect plan for your classroom needs</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <PricingPlan title="Basic" credits={500} price="NT$99" bestFor="Small groups or test use" />
              <PricingPlan title="Standard" credits={1000} price="NT$159" bestFor="Regular classroom activity" isPopular={true} />
              <PricingPlan title="Pro" credits={1750} price="NT$199" bestFor="Large classes or full access" />
            </div>

            <div className="glass-card p-6 rounded-xl mt-6">
              <h4 className="text-lg font-bold text-white mb-3">How Credits Work</h4>
              <div className="grid gap-3 text-white/80 text-sm">
                <div>• 1 Credit = 1 coin reward for students</div>
                <div className="bg-transparent">• Posting H.W = 5 credit, approving H.W = credits equal to the coin reward given to the student ( e.g. 3 coins = 3 credits ) 
              </div>
                <div>• Deleting Pokémon from student = 3 credits " chosen or random "</div>
                <div>•  Awarding random Pokémon 5 credits </div>
                <div>• Credits never expire once purchased</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default ContactDialog;