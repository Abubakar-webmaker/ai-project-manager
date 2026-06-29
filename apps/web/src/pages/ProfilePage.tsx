// src/pages/ProfilePage.tsx
import { useState } from "react";
import { User, Mail, Calendar, MapPin, Save } from "lucide-react";
import { useAppSelector } from "../store/hooks";
import Button from "../components/ui/Button/Button";

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32" />
        
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-16">
            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full rounded-2xl object-cover" alt={user.name} />
              ) : (
                <span className="text-4xl font-bold text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 pt-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <Button
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.name}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
