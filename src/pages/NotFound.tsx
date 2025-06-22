
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleGoToLogin = () => {
    navigate("/teacher-login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="text-center glass-card p-8 rounded-xl max-w-md mx-4">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/80 mb-6">Oops! Page not found</p>
        <p className="text-white/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            Return to Home
          </Button>
          <Button 
            onClick={handleGoToLogin}
            variant="outline"
            className="w-full bg-transparent hover:bg-white/10 text-white border-white/50"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
