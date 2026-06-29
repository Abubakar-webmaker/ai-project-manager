// src/pages/AnalyticsPage.tsx
import { BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-16">
        <BarChart3 className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Project insights and metrics coming soon...
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
