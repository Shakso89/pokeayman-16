import React from "react";
import { useNavigate } from "react-router-dom";
const Footer: React.FC = () => {
  const navigate = useNavigate();
  return <footer className="w-full bg-white/10 backdrop-blur-md py-6 text-center text-white">
      <div className="container mx-auto">
        <div className="flex justify-center mb-4">
          
        </div>
        <p>© 2025 PokéAyman. All rights reserved</p>
        <div className="flex justify-center mt-4 gap-4">
          <button onClick={() => navigate("/contact")} className="text-white hover:text-blue-200 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </footer>;
};
export default Footer;