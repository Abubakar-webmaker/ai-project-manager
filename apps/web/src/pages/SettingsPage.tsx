// src/pages/SettingsPage.tsx
import { Settings, Bell, Lock, Palette } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your notification preferences
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize your theme and display preferences
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Security</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update your password and security settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
