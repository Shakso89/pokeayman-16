
import React from "react";
import { Facebook, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/10 backdrop-blur-md py-4 text-center text-white">
      <div className="container mx-auto">
        <p>© 2025 PokéAyman. All rights reserved.</p>
        <div className="flex justify-center mt-2 gap-4">
          <a 
            href="https://www.facebook.com/ayman.soliman89/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-200 transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a 
            href="tel:+886900170038" 
            className="text-white hover:text-blue-200 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
