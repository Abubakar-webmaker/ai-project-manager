// src/pages/auth/OAuthCallbackPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Handle OAuth callback
    setTimeout(() => navigate("/dashboard"), 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
