// src/pages/TeamPage.tsx
import { Users } from "lucide-react";

const TeamPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Team Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Coming soon...
        </p>
      </div>
    </div>
  );
};

export default TeamPage;
