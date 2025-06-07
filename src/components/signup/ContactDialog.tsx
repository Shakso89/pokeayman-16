
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Mail, Phone, MessageCircle, Instagram, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const PricingCard: React.FC<{
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}> = ({ title, price, period, features, popular }) => (
  <div className={`rounded-2xl p-6 relative ${
    popular 
      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-blue-900' 
      : 'bg-white/10 text-white'
  }`}>
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star className="h-4 w-4" />
          Most Popular
        </div>
      </div>
    )}
    
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="text-4xl font-bold mb-1">{price}</div>
      <div className="text-sm opacity-75">{period}</div>
    </div>
    
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    
    <Button 
      className={`w-full ${
        popular 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-white/20 hover:bg-white/30'
      }`}
    >
      Get Started
    </Button>
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

  const pricingPlans = [
    {
      title: "Basic",
      price: "$29",
      period: "per month",
      features: [
        "Up to 50 students",
        "Basic Pokémon collection",
        "Standard rewards system",
        "Email support",
        "Basic analytics"
      ]
    },
    {
      title: "Professional",
      price: "$79",
      period: "per month",
      popular: true,
      features: [
        "Up to 200 students",
        "Premium Pokémon collection",
        "Advanced rewards & achievements",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "Parent notifications"
      ]
    },
    {
      title: "Enterprise",
      price: "$199",
      period: "per month",
      features: [
        "Unlimited students",
        "Complete Pokémon database",
        "Custom game mechanics",
        "24/7 dedicated support",
        "Full analytics suite",
        "White-label solution",
        "API access",
        "Training & onboarding"
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90 text-white border-gray-700 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Contact & Pricing</DialogTitle>
          <DialogDescription className="text-gray-300">
            Get in touch with us or choose your perfect plan
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="contact" className="text-white data-[state=active]:bg-white/20">
              Contact Us
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-white data-[state=active]:bg-white/20">
              Pricing Plans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Choose Your Adventure</h3>
              <p className="text-gray-300">Transform education with our Pokémon-powered platform</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={index} {...plan} />
              ))}
            </div>
            
            <div className="text-center mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">
                🎓 Educational discounts available for schools and institutions
              </p>
              <p className="text-sm text-gray-300">
                📞 Contact us for custom enterprise solutions
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
