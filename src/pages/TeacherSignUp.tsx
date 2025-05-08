import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { User, Mail, Lock, Contact, Upload, Image } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TeacherSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // For avatar selection/upload
  const defaultAvatars = [
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Pikachu
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", // Bulbasaur
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", // Charmander
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", // Squirtle
  ];
  
  // For file upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleSelectAvatar = (avatar: string) => {
    setAvatarUrl(avatar);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simple file validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create a URL for the selected file
    const fileUrl = URL.createObjectURL(file);
    setAvatarUrl(fileUrl);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Validate activation code
    if (!validateActivationCode(activationCode)) {
      toast({
        title: "Invalid activation code",
        description: "Please enter a valid activation code or contact us to get one.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Registration logic
    setTimeout(() => {
      // In a real app, you would make an API call to register the user
      
      const teacherId = "teacher-" + Date.now().toString();
      
      // Store user data in localStorage (this is a simple demo, in a real app, you would use a server)
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      teachers.push({
        id: teacherId,
        username,
        email,
        password, // In a real app, you would never store plain-text passwords
        avatarUrl,
        activationCode,
        activationExpiry: getActivationExpiry(activationCode),
        students: [],
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("teachers", JSON.stringify(teachers));
      
      // Mark activation code as used
      const usedCodes = JSON.parse(localStorage.getItem("usedActivationCodes") || "[]");
      usedCodes.push(activationCode);
      localStorage.setItem("usedActivationCodes", JSON.stringify(usedCodes));
      
      toast({
        title: "Account created",
        description: "Welcome to TR Ayman! You can now login.",
      });
      
      navigate("/teacher-login");
      setIsLoading(false);
    }, 1500);
  };
  
  // Function to validate activation code
  const validateActivationCode = (code: string): boolean => {
    // Special case for admin
    if (code === "ADMIN-MASTER-CODE") return true;
    
    // Check if code has been used
    const usedCodes = JSON.parse(localStorage.getItem("usedActivationCodes") || "[]");
    if (usedCodes.includes(code)) {
      toast({
        title: "Code already used",
        description: "This activation code has already been used.",
        variant: "destructive",
      });
      return false;
    }
    
    // Get valid codes from localStorage (in a real app, this would be a server check)
    const validCodes = JSON.parse(localStorage.getItem("activationCodes") || "[]");
    return validCodes.includes(code) || /^(TRIAL|MONTH|YEAR)\d+$/.test(code);
  };
  
  // Function to calculate activation expiry based on code type
  const getActivationExpiry = (code: string): string => {
    const now = new Date();
    
    if (code === "ADMIN-MASTER-CODE") {
      // Never expires for admin
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 100);
      return expiry.toISOString();
    } else if (code.startsWith("TRIAL")) {
      // 7-day trial
      const expiry = new Date(now);
      expiry.setDate(expiry.getDate() + 7);
      return expiry.toISOString();
    } else if (code.startsWith("MONTH")) {
      // Monthly subscription
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 1);
      return expiry.toISOString();
    } else if (code.startsWith("YEAR")) {
      // Annual subscription
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry.toISOString();
    }
    
    return ""; // Invalid code
  };
  
  return (
    <AuthLayout
      title="Teacher Sign Up"
      description="Create your account to manage your classes"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar selection */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-2 text-center">
            <Label>Choose an Avatar</Label>
          </div>
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              <User className="h-12 w-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {defaultAvatars.map((avatar, index) => (
              <button
                key={index}
                type="button"
                className={`rounded-full p-1 ${
                  avatarUrl === avatar ? 'ring-2 ring-primary' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSelectAvatar(avatar)}
              >
                <img src={avatar} alt={`Avatar ${index}`} className="w-10 h-10 rounded-full" />
              </button>
            ))}
            
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={handleUploadClick}
            >
              <Upload className="h-5 w-5 text-gray-600" />
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </button>
          </div>
        </div>
        
        {/* Username field */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              required
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
        
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
        
        {/* Confirm Password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
        
        {/* Activation Code field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="activationCode">Activation Code</Label>
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              onClick={() => setContactDialogOpen(true)}
              className="text-xs"
            >
              Need a code?
            </Button>
          </div>
          <Input
            id="activationCode"
            placeholder="Enter your activation code"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">
            Use code starting with TRIAL for a 7-day trial
          </p>
        </div>
        
        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
        
        <div className="text-center text-sm mt-2">
          <p>
            Already have an account?{" "}
            <button 
              type="button" 
              onClick={() => navigate("/teacher-login")}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
      
      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
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
            <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default TeacherSignUp;
