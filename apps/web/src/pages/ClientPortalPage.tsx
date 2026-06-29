// src/pages/ClientPortalPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ClientPortalPage = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        // TODO: Implement client portal API call
        // const { data } = await clientPortalService.access(token!);
        // setPortal(data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load portal");
        setLoading(false);
      }
    };

    if (token) {
      fetchPortal();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Client Portal
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to your project portal. You can view project progress and approve tasks here.
          </p>
          
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Portal functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;
